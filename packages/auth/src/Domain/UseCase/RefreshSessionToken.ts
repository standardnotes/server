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

export class RefreshSessionToken {
  constructor(
    private sessionService: SessionServiceInterface,
    private domainEventFactory: DomainEventFactoryInterface,
    private domainEventPublisher: DomainEventPublisherInterface,
    private timer: TimerInterface,
    private getSetting: GetSetting,
    private logger: Logger,
  ) {}

  async execute(dto: RefreshSessionTokenDTO): Promise<RefreshSessionTokenResponse> {
    const { session, isEphemeral } = await this.sessionService.getSessionFromToken(dto.accessToken)
    if (!session) {
      return {
        success: false,
        errorTag: 'invalid-parameters',
        errorMessage: 'The provided parameters are not valid.',
      }
    }

    if (!this.sessionService.isRefreshTokenMatchingHashedSessionToken(session, dto.refreshToken)) {
      return {
        success: false,
        errorTag: 'invalid-refresh-token',
        errorMessage: 'The refresh token is not valid.',
      }
    }

    if (session.refreshExpiration < this.timer.getUTCDate()) {
      return {
        success: false,
        errorTag: 'expired-refresh-token',
        errorMessage: 'The refresh token has expired.',
      }
    }

    if (await this.isLoggingUserAgentEnabledOnSessions(session.userUuid)) {
      session.userAgent = dto.userAgent
    }

    const sessionPayload = await this.sessionService.refreshTokens({ session, isEphemeral })

    try {
      await this.domainEventPublisher.publish(
        this.domainEventFactory.createSessionRefreshedEvent({ userUuid: session.userUuid }),
      )
    } catch (error) {
      this.logger.error(`Failed to publish session refreshed event: ${(error as Error).message}`)
    }

    return {
      success: true,
      sessionPayload,
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
}
