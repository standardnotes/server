import * as crypto from 'crypto'
import * as dayjs from 'dayjs'
import { v4 as uuidv4 } from 'uuid'
import { UAParserInstance } from 'ua-parser-js'
import { TimerInterface } from '@standardnotes/time'
import { Logger } from 'winston'
import { LogSessionUserAgentOption, SettingName } from '@standardnotes/settings'
import { SessionBody } from '@standardnotes/responses'
import { CryptoNode } from '@standardnotes/sncrypto-node'

import { Session } from './Session'
import { SessionRepositoryInterface } from './SessionRepositoryInterface'
import { SessionServiceInterface } from './SessionServiceInterface'
import { User } from '../User/User'
import { EphemeralSessionRepositoryInterface } from './EphemeralSessionRepositoryInterface'
import { EphemeralSession } from './EphemeralSession'
import { RevokedSession } from './RevokedSession'
import { RevokedSessionRepositoryInterface } from './RevokedSessionRepositoryInterface'
import { TraceSession } from '../UseCase/TraceSession/TraceSession'
import { UserSubscriptionRepositoryInterface } from '../Subscription/UserSubscriptionRepositoryInterface'
import { GetSetting } from '../UseCase/GetSetting/GetSetting'

export class SessionService implements SessionServiceInterface {
  static readonly SESSION_TOKEN_VERSION = 1

  constructor(
    private sessionRepository: SessionRepositoryInterface,
    private ephemeralSessionRepository: EphemeralSessionRepositoryInterface,
    private revokedSessionRepository: RevokedSessionRepositoryInterface,
    private deviceDetector: UAParserInstance,
    private timer: TimerInterface,
    private logger: Logger,
    private accessTokenAge: number,
    private refreshTokenAge: number,
    private cryptoNode: CryptoNode,
    private traceSession: TraceSession,
    private userSubscriptionRepository: UserSubscriptionRepositoryInterface,
    private readonlyUsers: string[],
    private getSetting: GetSetting,
  ) {}

  async createNewSessionForUser(dto: {
    user: User
    apiVersion: string
    userAgent: string
    readonlyAccess: boolean
  }): Promise<{ sessionHttpRepresentation: SessionBody; session: Session }> {
    const session = await this.createSession({
      ephemeral: false,
      ...dto,
    })

    const sessionPayload = await this.createTokens(session)

    await this.sessionRepository.insert(session)

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

    return {
      sessionHttpRepresentation: sessionPayload,
      session,
    }
  }

  async createNewEphemeralSessionForUser(dto: {
    user: User
    apiVersion: string
    userAgent: string
    readonlyAccess: boolean
  }): Promise<{ sessionHttpRepresentation: SessionBody; session: Session }> {
    const ephemeralSession = await this.createSession({
      ephemeral: true,
      ...dto,
    })

    const sessionPayload = await this.createTokens(ephemeralSession)

    await this.ephemeralSessionRepository.insert(ephemeralSession)

    return {
      sessionHttpRepresentation: sessionPayload,
      session: ephemeralSession,
    }
  }

  async refreshTokens(dto: { session: Session; isEphemeral: boolean }): Promise<SessionBody> {
    const sessionPayload = await this.createTokens(dto.session)

    if (dto.isEphemeral) {
      await this.ephemeralSessionRepository.update(dto.session)
    } else {
      await this.sessionRepository.update(dto.session)
    }

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

  async getSessionFromToken(token: string): Promise<{ session: Session | undefined; isEphemeral: boolean }> {
    const tokenParts = token.split(':')
    const sessionUuid = tokenParts[1]
    const accessToken = tokenParts[2]
    if (!accessToken) {
      return { session: undefined, isEphemeral: false }
    }

    const { session, isEphemeral } = await this.getSession(sessionUuid)
    if (!session) {
      return { session: undefined, isEphemeral: false }
    }

    const hashedAccessToken = crypto.createHash('sha256').update(accessToken).digest('hex')
    if (crypto.timingSafeEqual(Buffer.from(session.hashedAccessToken), Buffer.from(hashedAccessToken))) {
      return { session, isEphemeral }
    }

    return { session: undefined, isEphemeral: false }
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

    await this.revokedSessionRepository.update(revokedSession)

    return revokedSession
  }

  async deleteSessionByToken(token: string): Promise<string | null> {
    const { session, isEphemeral } = await this.getSessionFromToken(token)

    if (session) {
      if (isEphemeral) {
        await this.ephemeralSessionRepository.deleteOne(session.uuid, session.userUuid)
      } else {
        await this.sessionRepository.deleteOneByUuid(session.uuid)
      }

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

    await this.revokedSessionRepository.insert(revokedSession)

    return revokedSession
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

  private async getSession(uuid: string): Promise<{
    session: Session | null
    isEphemeral: boolean
  }> {
    let session = await this.ephemeralSessionRepository.findOneByUuid(uuid)
    let isEphemeral = true

    if (!session) {
      session = await this.sessionRepository.findOneByUuid(uuid)
      isEphemeral = false
    }

    return { session, isEphemeral }
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
    const loggingSettingOrError = await this.getSetting.execute({
      settingName: SettingName.NAMES.LogSessionUserAgent,
      decrypted: true,
      userUuid: user.uuid,
      allowSensitiveRetrieval: true,
    })
    if (loggingSettingOrError.isFailed()) {
      return true
    }
    const loggingSetting = loggingSettingOrError.getValue()

    return loggingSetting.decryptedValue === LogSessionUserAgentOption.Enabled
  }
}
