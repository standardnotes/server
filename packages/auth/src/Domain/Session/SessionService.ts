import * as crypto from 'crypto'
import * as dayjs from 'dayjs'
import { UAParser } from 'ua-parser-js'
import { inject, injectable } from 'inversify'
import { v4 as uuidv4 } from 'uuid'
import { TimerInterface } from '@standardnotes/time'
import { Logger } from 'winston'
import { LogSessionUserAgentOption, SettingName } from '@standardnotes/settings'
import { SessionBody } from '@standardnotes/responses'
import { CryptoNode } from '@standardnotes/sncrypto-node'

import TYPES from '../../Bootstrap/Types'
import { Session } from './Session'
import { SessionRepositoryInterface } from './SessionRepositoryInterface'
import { SessionServiceInterface } from './SessionServiceInterface'
import { User } from '../User/User'
import { EphemeralSessionRepositoryInterface } from './EphemeralSessionRepositoryInterface'
import { EphemeralSession } from './EphemeralSession'
import { RevokedSession } from './RevokedSession'
import { RevokedSessionRepositoryInterface } from './RevokedSessionRepositoryInterface'
import { SettingServiceInterface } from '../Setting/SettingServiceInterface'
import { TraceSession } from '../UseCase/TraceSession/TraceSession'
import { UserSubscriptionRepositoryInterface } from '../Subscription/UserSubscriptionRepositoryInterface'

@injectable()
export class SessionService implements SessionServiceInterface {
  static readonly SESSION_TOKEN_VERSION = 1

  constructor(
    @inject(TYPES.Auth_SessionRepository) private sessionRepository: SessionRepositoryInterface,
    @inject(TYPES.Auth_EphemeralSessionRepository)
    private ephemeralSessionRepository: EphemeralSessionRepositoryInterface,
    @inject(TYPES.Auth_RevokedSessionRepository) private revokedSessionRepository: RevokedSessionRepositoryInterface,
    @inject(TYPES.Auth_DeviceDetector) private deviceDetector: UAParser,
    @inject(TYPES.Auth_Timer) private timer: TimerInterface,
    @inject(TYPES.Auth_Logger) private logger: Logger,
    @inject(TYPES.Auth_ACCESS_TOKEN_AGE) private accessTokenAge: number,
    @inject(TYPES.Auth_REFRESH_TOKEN_AGE) private refreshTokenAge: number,
    @inject(TYPES.Auth_SettingService) private settingService: SettingServiceInterface,
    @inject(TYPES.Auth_CryptoNode) private cryptoNode: CryptoNode,
    @inject(TYPES.Auth_TraceSession) private traceSession: TraceSession,
    @inject(TYPES.Auth_UserSubscriptionRepository)
    private userSubscriptionRepository: UserSubscriptionRepositoryInterface,
    @inject(TYPES.Auth_READONLY_USERS) private readonlyUsers: string[],
  ) {}

  async createNewSessionForUser(dto: {
    user: User
    apiVersion: string
    userAgent: string
    readonlyAccess: boolean
  }): Promise<SessionBody> {
    const session = await this.createSession({
      ephemeral: false,
      ...dto,
    })

    const sessionPayload = await this.createTokens(session)

    await this.sessionRepository.save(session)

    try {
      const userSubscription = await this.userSubscriptionRepository.findOneByUserUuid(dto.user.uuid)
      const traceSessionResult = await this.traceSession.execute({
        userUuid: dto.user.uuid,
        username: dto.user.email,
        subscriptionPlanName: userSubscription ? userSubscription.planName : null,
      })
      if (traceSessionResult.isFailed()) {
        this.logger.error(traceSessionResult.getError())
      }
    } catch (error) {
      this.logger.error(`Could not trace session while creating cross service token.: ${(error as Error).message}`)
    }

    return sessionPayload
  }

  async createNewEphemeralSessionForUser(dto: {
    user: User
    apiVersion: string
    userAgent: string
    readonlyAccess: boolean
  }): Promise<SessionBody> {
    const ephemeralSession = await this.createSession({
      ephemeral: true,
      ...dto,
    })

    const sessionPayload = await this.createTokens(ephemeralSession)

    await this.ephemeralSessionRepository.save(ephemeralSession)

    return sessionPayload
  }

  async refreshTokens(session: Session): Promise<SessionBody> {
    const sessionPayload = await this.createTokens(session)

    await this.sessionRepository.updateHashedTokens(session.uuid, session.hashedAccessToken, session.hashedRefreshToken)

    await this.sessionRepository.updatedTokenExpirationDates(
      session.uuid,
      session.accessExpiration,
      session.refreshExpiration,
    )

    await this.ephemeralSessionRepository.updateTokensAndExpirationDates(
      session.uuid,
      session.hashedAccessToken,
      session.hashedRefreshToken,
      session.accessExpiration,
      session.refreshExpiration,
    )

    return sessionPayload
  }

  isRefreshTokenMatchingHashedSessionToken(session: Session, token: string): boolean {
    const tokenParts = token.split(':')
    const refreshToken = tokenParts[2]
    if (!refreshToken) {
      return false
    }

    const hashedRefreshToken = crypto.createHash('sha256').update(refreshToken).digest('hex')

    return crypto.timingSafeEqual(Buffer.from(hashedRefreshToken), Buffer.from(session.hashedRefreshToken))
  }

  getOperatingSystemInfoFromUserAgent(userAgent: string): string {
    try {
      const userAgentParsed = this.deviceDetector.setUA(userAgent).getResult()

      const osInfo = `${userAgentParsed.os.name ?? ''} ${userAgentParsed.os.version ?? ''}`.trim()

      if (userAgentParsed.ua.toLowerCase().indexOf('okhttp') >= 0) {
        return 'Android'
      }

      return osInfo
    } catch (error) {
      this.logger.warn(`Could not parse operating system info. User agent: ${userAgent}: ${(error as Error).message}`)

      return 'Unknown OS'
    }
  }

  getBrowserInfoFromUserAgent(userAgent: string): string {
    try {
      const userAgentParsed = this.deviceDetector.setUA(userAgent).getResult()

      let clientInfo = `${userAgentParsed.browser.name ?? ''} ${userAgentParsed.browser.version ?? ''}`.trim()

      const desktopAppMatches = [
        ...userAgentParsed.ua.matchAll(/(.*)StandardNotes\/((0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*))/g),
      ]
      if (desktopAppMatches[0] && desktopAppMatches[0][2]) {
        clientInfo = `Standard Notes Desktop ${desktopAppMatches[0][2]}`
      }

      return clientInfo
    } catch (error) {
      this.logger.warn(`Could not parse browser info. User agent: ${userAgent}: ${(error as Error).message}`)

      return 'Unknown Client'
    }
  }

  getDeviceInfo(session: Session): string {
    if (!session.userAgent) {
      return 'Unknown Client on Unknown OS'
    }

    const browserInfo = this.getBrowserInfoFromUserAgent(session.userAgent)
    const osInfo = this.getOperatingSystemInfoFromUserAgent(session.userAgent)

    if (osInfo && !browserInfo) {
      return osInfo
    }

    if (browserInfo && !osInfo) {
      return browserInfo
    }

    if (!browserInfo && !osInfo) {
      return 'Unknown Client on Unknown OS'
    }

    return `${browserInfo} on ${osInfo}`
  }

  async getSessionFromToken(token: string): Promise<Session | undefined> {
    const tokenParts = token.split(':')
    const sessionUuid = tokenParts[1]
    const accessToken = tokenParts[2]
    if (!accessToken) {
      return undefined
    }

    const session = await this.getSession(sessionUuid)
    if (!session) {
      return undefined
    }

    const hashedAccessToken = crypto.createHash('sha256').update(accessToken).digest('hex')
    if (crypto.timingSafeEqual(Buffer.from(session.hashedAccessToken), Buffer.from(hashedAccessToken))) {
      return session
    }

    return undefined
  }

  async getRevokedSessionFromToken(token: string): Promise<RevokedSession | null> {
    const tokenParts = token.split(':')
    const sessionUuid = tokenParts[1]
    if (!sessionUuid) {
      return null
    }

    return this.revokedSessionRepository.findOneByUuid(sessionUuid)
  }

  async markRevokedSessionAsReceived(revokedSession: RevokedSession): Promise<RevokedSession> {
    revokedSession.received = true
    revokedSession.receivedAt = this.timer.getUTCDate()

    return this.revokedSessionRepository.save(revokedSession)
  }

  async deleteSessionByToken(token: string): Promise<string | null> {
    const session = await this.getSessionFromToken(token)

    if (session) {
      await this.sessionRepository.deleteOneByUuid(session.uuid)
      await this.ephemeralSessionRepository.deleteOne(session.uuid, session.userUuid)

      return session.userUuid
    }

    return null
  }

  async createRevokedSession(session: Session): Promise<RevokedSession> {
    const revokedSession = new RevokedSession()
    revokedSession.uuid = session.uuid
    revokedSession.userUuid = session.userUuid
    revokedSession.createdAt = this.timer.getUTCDate()
    revokedSession.apiVersion = session.apiVersion
    revokedSession.userAgent = session.userAgent

    return this.revokedSessionRepository.save(revokedSession)
  }

  private async createSession(dto: {
    user: User
    apiVersion: string
    userAgent: string
    ephemeral: boolean
    readonlyAccess: boolean
  }): Promise<Session> {
    let session = new Session()
    if (dto.ephemeral) {
      session = new EphemeralSession()
    }
    session.uuid = uuidv4()
    if (await this.isLoggingUserAgentEnabledOnSessions(dto.user)) {
      session.userAgent = dto.userAgent
    }
    session.userUuid = dto.user.uuid
    session.apiVersion = dto.apiVersion
    session.createdAt = this.timer.getUTCDate()
    session.updatedAt = this.timer.getUTCDate()

    const userIsReadonly = this.readonlyUsers.includes(dto.user.email)
    session.readonlyAccess = userIsReadonly || dto.readonlyAccess

    return session
  }

  private async getSession(uuid: string): Promise<Session | null> {
    let session = await this.ephemeralSessionRepository.findOneByUuid(uuid)

    if (!session) {
      session = await this.sessionRepository.findOneByUuid(uuid)
    }

    return session
  }

  private async createTokens(session: Session): Promise<SessionBody> {
    const accessToken = this.cryptoNode.base64URLEncode(await this.cryptoNode.generateRandomKey(48))
    const refreshToken = this.cryptoNode.base64URLEncode(await this.cryptoNode.generateRandomKey(48))

    const hashedAccessToken = crypto.createHash('sha256').update(accessToken).digest('hex')
    const hashedRefreshToken = crypto.createHash('sha256').update(refreshToken).digest('hex')
    session.hashedAccessToken = hashedAccessToken
    session.hashedRefreshToken = hashedRefreshToken

    const accessTokenExpiration = dayjs.utc().add(this.accessTokenAge, 'second').toDate()
    const refreshTokenExpiration = dayjs.utc().add(this.refreshTokenAge, 'second').toDate()
    session.accessExpiration = accessTokenExpiration
    session.refreshExpiration = refreshTokenExpiration

    return {
      access_token: `${SessionService.SESSION_TOKEN_VERSION}:${session.uuid}:${accessToken}`,
      refresh_token: `${SessionService.SESSION_TOKEN_VERSION}:${session.uuid}:${refreshToken}`,
      access_expiration: this.timer.convertStringDateToMilliseconds(accessTokenExpiration.toString()),
      refresh_expiration: this.timer.convertStringDateToMilliseconds(refreshTokenExpiration.toString()),
      readonly_access: session.readonlyAccess,
    }
  }

  private async isLoggingUserAgentEnabledOnSessions(user: User): Promise<boolean> {
    const loggingSetting = await this.settingService.findSettingWithDecryptedValue({
      settingName: SettingName.create(SettingName.NAMES.LogSessionUserAgent).getValue(),
      userUuid: user.uuid,
    })

    if (loggingSetting === null) {
      return true
    }

    return loggingSetting.value === LogSessionUserAgentOption.Enabled
  }
}
