import { inject, injectable } from 'inversify'
import { DomainEventPublisherInterface } from '@standardnotes/domain-events'
import { TimerInterface } from '@standardnotes/time'
import { Logger } from 'winston'

import TYPES from '../../Bootstrap/Types'
import { SessionServiceInterface } from '../Session/SessionServiceInterface'
import { DomainEventFactoryInterface } from '../Event/DomainEventFactoryInterface'

import { RefreshSessionTokenResponse } from './RefreshSessionTokenResponse'
import { RefreshSessionTokenDTO } from './RefreshSessionTokenDTO'

@injectable()
export class RefreshSessionToken {
  constructor(
    @inject(TYPES.SessionService) private sessionService: SessionServiceInterface,
    @inject(TYPES.DomainEventFactory) private domainEventFactory: DomainEventFactoryInterface,
    @inject(TYPES.DomainEventPublisher) private domainEventPublisher: DomainEventPublisherInterface,
    @inject(TYPES.Timer) private timer: TimerInterface,
    @inject(TYPES.Logger) private logger: Logger,
  ) {}

  async execute(dto: RefreshSessionTokenDTO): Promise<RefreshSessionTokenResponse> {
    const session = await this.sessionService.getSessionFromToken(dto.accessToken)
    if (!session) {
      return {
        success: false,
        errorTag: 'invalid-parameters',
        errorMessage: 'The provided parameters are not valid.',
      }
    }

    if (!this.sessionService.isRefreshTokenValid(session, dto.refreshToken)) {
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

    const sessionPayload = await this.sessionService.refreshTokens(session)

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
}
