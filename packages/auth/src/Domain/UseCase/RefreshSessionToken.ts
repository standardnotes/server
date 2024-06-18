import * as crypto from 'crypto'
import { DomainEventPublisherInterface } from '@standardnotes/domain-events'
import { TimerInterface } from '@standardnotes/time'
import { SettingName } from '@standardnotes/domain-core'
import { LogSessionUserAgentOption } from '@standardnotes/settings'
import { Logger } from 'winston'

import { SessionServiceInterface } from '../Session/SessionServiceInterface'
import { DomainEventFactoryInterface } from '../Event/DomainEventFactoryInterface'

import { RefreshSessionTokenResponse } from './RefreshSessionTokenResponse'
import { RefreshSessionTokenDTO } from './RefreshSessionTokenDTO'
import { GetSetting } from './GetSetting/GetSetting'
import { SessionService } from '../Session/SessionService'
import { ApiVersion } from '../Api/ApiVersion'
import { CooldownSessionTokens } from './CooldownSessionTokens/CooldownSessionTokens'
import { GetSessionFromToken } from './GetSessionFromToken/GetSessionFromToken'

export class RefreshSessionToken {
  constructor(
    private sessionService: SessionServiceInterface,
    private domainEventFactory: DomainEventFactoryInterface,
    private domainEventPublisher: DomainEventPublisherInterface,
    private timer: TimerInterface,
    private getSetting: GetSetting,
    private cooldownSessionTokens: CooldownSessionTokens,
    private getSessionFromToken: GetSessionFromToken,
    private logger: Logger,
  ) {}

  async execute(dto: RefreshSessionTokenDTO): Promise<RefreshSessionTokenResponse> {
    const apiVersionOrError = ApiVersion.create(dto.apiVersion)
    if (apiVersionOrError.isFailed()) {
      this.logger.debug(`Invalid API version: ${dto.apiVersion}`, {
        codeTag: 'RefreshSessionToken',
      })

      return {
        success: false,
        errorTag: 'invalid-parameters',
        errorMessage: 'The provided parameters are not valid.',
      }
    }
    const apiVersion = apiVersionOrError.getValue()

    const resultOrError = await this.getSessionFromToken.execute({
      authCookies: dto.authCookies,
      authTokenFromHeaders: dto.authTokenFromHeaders,
      requestMetadata: dto.requestMetadata,
    })
    if (resultOrError.isFailed()) {
      this.logger.debug('No session found for auth token from headers and cookies', {
        codeTag: 'RefreshSessionToken',
      })

      return {
        success: false,
        errorTag: 'invalid-parameters',
        errorMessage: 'The provided parameters are not valid.',
      }
    }
    const { session, isEphemeral, givenTokensWereInCooldown, cooldownHashedRefreshToken } = resultOrError.getValue()

    let hashedRefreshToken = session.hashedRefreshToken
    /* istanbul ignore next */
    if (givenTokensWereInCooldown) {
      this.logger.warn('Given tokens were in cooldown', {
        codeTag: 'RefreshSessionToken',
        userId: session?.userUuid,
        sessionUuid: session?.uuid,
        snjs: dto.requestMetadata.snjs,
        application: dto.requestMetadata.application,
        url: dto.requestMetadata.url,
        method: dto.requestMetadata.method,
        userAgent: session.userAgent,
        secChUa: session.userAgent ? dto.requestMetadata.secChUa : undefined,
      })

      hashedRefreshToken = cooldownHashedRefreshToken as string
    }

    const refreshTokens =
      session.version === SessionService.COOKIE_BASED_SESSION_VERSION
        ? dto.authCookies?.get(`refresh_token_${session.uuid}`)
        : [dto.refreshTokenFromHeaders]
    if (!refreshTokens || refreshTokens.length === 0) {
      this.logger.debug('No refresh token found for session', {
        codeTag: 'RefreshSessionToken',
      })

      return {
        success: false,
        errorTag: 'invalid-refresh-token',
        errorMessage: 'The refresh token is not valid.',
      }
    }

    const anyRefreshTokenMatchingHashedSessionToken = refreshTokens.some((refreshToken) =>
      this.isRefreshTokenMatchingHashedSessionToken(session.version, hashedRefreshToken, refreshToken),
    )

    if (!anyRefreshTokenMatchingHashedSessionToken) {
      this.logger.debug('Refresh token does not match session', {
        codeTag: 'RefreshSessionToken',
      })

      return {
        success: false,
        errorTag: 'invalid-refresh-token',
        errorMessage: 'The refresh token is not valid.',
      }
    }

    if (session.refreshExpiration < this.timer.getUTCDate()) {
      this.logger.debug('Refresh token has expired', {
        codeTag: 'RefreshSessionToken',
      })

      return {
        success: false,
        errorTag: 'expired-refresh-token',
        errorMessage: 'The refresh token has expired.',
      }
    }

    if (await this.isLoggingUserAgentEnabledOnSessions(session.userUuid)) {
      session.userAgent = dto.requestMetadata.userAgent as string
    }

    const hashedAccessTokenBeforeCooldown = session.hashedAccessToken
    const hashedRefreshTokenBeforeCooldown = session.hashedRefreshToken

    const sessionCreationResult = await this.sessionService.refreshTokens({
      session,
      isEphemeral,
      apiVersion,
      snjs: dto.requestMetadata.snjs,
      application: dto.requestMetadata.application,
    })

    await this.cooldownSessionTokens.execute({
      sessionUuid: session.uuid,
      hashedAccessToken: hashedAccessTokenBeforeCooldown,
      hashedRefreshToken: hashedRefreshTokenBeforeCooldown,
    })

    try {
      await this.domainEventPublisher.publish(
        this.domainEventFactory.createSessionRefreshedEvent({ userUuid: session.userUuid }),
      )
    } catch (error) {
      this.logger.error(`Failed to publish session refreshed event: ${(error as Error).message}`)
    }

    return {
      success: true,
      result: sessionCreationResult,
      userUuid: session.userUuid,
    }
  }

  private async isLoggingUserAgentEnabledOnSessions(userUuid: string): Promise<boolean> {
    const loggingSettingOrError = await this.getSetting.execute({
      settingName: SettingName.NAMES.LogSessionUserAgent,
      decrypted: true,
      userUuid: userUuid,
      allowSensitiveRetrieval: true,
    })
    if (loggingSettingOrError.isFailed()) {
      return true
    }
    const loggingSetting = loggingSettingOrError.getValue()

    return loggingSetting.decryptedValue === LogSessionUserAgentOption.Enabled
  }

  private isRefreshTokenMatchingHashedSessionToken(
    sessionVersion: number | null,
    sessionHashedRefreshToken: string,
    token: string,
  ): boolean {
    let refreshToken = null
    switch (sessionVersion) {
      case SessionService.COOKIE_BASED_SESSION_VERSION:
        refreshToken = token
        break
      case SessionService.HEADER_BASED_SESSION_VERSION: {
        const tokenParts = token.split(':')
        refreshToken = tokenParts[2]
        break
      }
    }

    if (!refreshToken) {
      return false
    }

    const hashedRefreshToken = crypto.createHash('sha256').update(refreshToken).digest('hex')

    return crypto.timingSafeEqual(Buffer.from(hashedRefreshToken), Buffer.from(sessionHashedRefreshToken))
  }
}
