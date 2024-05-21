import * as crypto from 'crypto'
import * as dayjs from 'dayjs'
import { v4 as uuidv4 } from 'uuid'
import { UAParserInstance } from 'ua-parser-js'
import { TimerInterface } from '@standardnotes/time'
import { Logger } from 'winston'
import { SettingName } from '@standardnotes/domain-core'
import { LogSessionUserAgentOption } from '@standardnotes/settings'
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
import { SessionCreationResult } from './SessionCreationResult'
import { ApiVersion } from '../Api/ApiVersion'

export class SessionService implements SessionServiceInterface {
  static readonly SESSION_TOKEN_VERSION = 1
  static readonly COOKIE_SESSION_TOKEN_VERSION = 2
  static readonly HEADER_BASED_SESSION_VERSION = 1
  static readonly COOKIE_BASED_SESSION_VERSION = 2

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
    private forceLegacySessions: boolean,
  ) {}

  async createNewSessionForUser(dto: {
    user: User
    apiVersion: ApiVersion
    userAgent: string
    readonlyAccess: boolean
    snjs?: string
    application?: string
  }): Promise<SessionCreationResult> {
    const session = await this.createSession({
      ephemeral: false,
      ...dto,
    })

    const sessionPayload = await this.createTokens(session, dto.apiVersion)

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
      ...sessionPayload,
      session,
    }
  }

  async createNewEphemeralSessionForUser(dto: {
    user: User
    apiVersion: ApiVersion
    userAgent: string
    readonlyAccess: boolean
    snjs?: string
    application?: string
  }): Promise<SessionCreationResult> {
    const ephemeralSession = await this.createSession({
      ephemeral: true,
      ...dto,
    })

    const sessionPayload = await this.createTokens(ephemeralSession, dto.apiVersion)

    await this.ephemeralSessionRepository.insert(ephemeralSession)

    return {
      ...sessionPayload,
      session: ephemeralSession,
    }
  }

  async refreshTokens(dto: {
    session: Session
    isEphemeral: boolean
    apiVersion: ApiVersion
    snjs?: string
    application?: string
  }): Promise<SessionCreationResult> {
    const sessionPayload = await this.createTokens(dto.session, dto.apiVersion)

    dto.session.apiVersion = dto.apiVersion.value
    dto.session.version = this.shouldOperateOnCookieBasedSessions(dto.apiVersion)
      ? SessionService.COOKIE_BASED_SESSION_VERSION
      : SessionService.HEADER_BASED_SESSION_VERSION
    dto.session.snjs = dto.snjs ?? null
    dto.session.application = dto.application ?? null

    if (dto.isEphemeral) {
      await this.ephemeralSessionRepository.update(dto.session)
    } else {
      await this.sessionRepository.update(dto.session)
    }

    return {
      ...sessionPayload,
      session: dto.session,
    }
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

  async getRevokedSessionFromToken(token: string): Promise<RevokedSession | null> {
    const tokenParts = token.split(':')
    const tokenVersion = parseInt(tokenParts[0])

    switch (tokenVersion) {
      case SessionService.SESSION_TOKEN_VERSION: {
        const sessionUuid = tokenParts[1]
        if (!sessionUuid) {
          return null
        }

        return this.revokedSessionRepository.findOneByUuid(sessionUuid)
      }
      case SessionService.COOKIE_SESSION_TOKEN_VERSION: {
        const privateIdentifier = tokenParts[1]
        if (!privateIdentifier) {
          return null
        }

        return this.revokedSessionRepository.findOneByPrivateIdentifier(privateIdentifier)
      }
    }

    return null
  }

  async markRevokedSessionAsReceived(revokedSession: RevokedSession): Promise<RevokedSession> {
    revokedSession.received = true
    revokedSession.receivedAt = this.timer.getUTCDate()

    await this.revokedSessionRepository.update(revokedSession)

    return revokedSession
  }

  async createRevokedSession(session: Session): Promise<RevokedSession> {
    const revokedSession = new RevokedSession()
    revokedSession.uuid = session.uuid
    revokedSession.userUuid = session.userUuid
    revokedSession.createdAt = this.timer.getUTCDate()
    revokedSession.apiVersion = session.apiVersion
    revokedSession.userAgent = session.userAgent
    revokedSession.privateIdentifier = session.privateIdentifier

    await this.revokedSessionRepository.insert(revokedSession)

    return revokedSession
  }

  private async createSession(dto: {
    user: User
    apiVersion: ApiVersion
    userAgent: string
    ephemeral: boolean
    readonlyAccess: boolean
    snjs?: string
    application?: string
  }): Promise<Session> {
    let session = new Session()
    if (dto.ephemeral) {
      session = new EphemeralSession()
    }
    session.uuid = uuidv4()
    session.privateIdentifier = await this.cryptoNode.generateRandomKey(128)
    if (await this.isLoggingUserAgentEnabledOnSessions(dto.user)) {
      session.userAgent = dto.userAgent
    }
    session.snjs = dto.snjs ?? null
    session.application = dto.application ?? null
    session.userUuid = dto.user.uuid
    session.apiVersion = dto.apiVersion.value
    session.createdAt = this.timer.getUTCDate()
    session.updatedAt = this.timer.getUTCDate()
    session.version = this.shouldOperateOnCookieBasedSessions(dto.apiVersion)
      ? SessionService.COOKIE_BASED_SESSION_VERSION
      : SessionService.HEADER_BASED_SESSION_VERSION

    const userIsReadonly = this.readonlyUsers.includes(dto.user.email)
    session.readonlyAccess = userIsReadonly || dto.readonlyAccess

    return session
  }

  private async createTokens(
    session: Session,
    apiVersion: ApiVersion,
  ): Promise<{
    sessionHttpRepresentation: SessionBody
    sessionCookieRepresentation: {
      accessToken: string
      refreshToken: string
    }
  }> {
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
    if (!session.privateIdentifier) {
      session.privateIdentifier = await this.cryptoNode.generateRandomKey(128)
    }

    const accessTokenForHeaderPurposes = this.shouldOperateOnCookieBasedSessions(apiVersion)
      ? `${SessionService.COOKIE_SESSION_TOKEN_VERSION}:${session.privateIdentifier}`
      : `${SessionService.SESSION_TOKEN_VERSION}:${session.uuid}:${accessToken}`
    const refreshTokenForHeaderPurposes = this.shouldOperateOnCookieBasedSessions(apiVersion)
      ? `${SessionService.COOKIE_SESSION_TOKEN_VERSION}:${session.privateIdentifier}`
      : `${SessionService.SESSION_TOKEN_VERSION}:${session.uuid}:${refreshToken}`

    return {
      sessionHttpRepresentation: {
        access_token: accessTokenForHeaderPurposes,
        refresh_token: refreshTokenForHeaderPurposes,
        access_expiration: this.timer.convertStringDateToMilliseconds(accessTokenExpiration.toString()),
        refresh_expiration: this.timer.convertStringDateToMilliseconds(refreshTokenExpiration.toString()),
        readonly_access: session.readonlyAccess,
      },
      sessionCookieRepresentation: {
        accessToken,
        refreshToken,
      },
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

  private shouldOperateOnCookieBasedSessions(apiVersion: ApiVersion): boolean {
    if (this.forceLegacySessions) {
      return false
    }

    return ApiVersion.VERSIONS.v20240226 === apiVersion.value
  }
}
