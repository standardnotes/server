import { DomainEventHandlerInterface, UserDisabledSessionUserAgentLoggingEvent } from '@standardnotes/domain-events'
import { inject, injectable } from 'inversify'

import TYPES from '../../Bootstrap/Types'
import { RevokedSessionRepositoryInterface } from '../Session/RevokedSessionRepositoryInterface'
import { SessionRepositoryInterface } from '../Session/SessionRepositoryInterface'

@injectable()
export class UserDisabledSessionUserAgentLoggingEventHandler implements DomainEventHandlerInterface {
  constructor(
    @inject(TYPES.Auth_SessionRepository) private sessionRepository: SessionRepositoryInterface,
    @inject(TYPES.Auth_SessionRepository) private revokedSessionRepository: RevokedSessionRepositoryInterface,
  ) {}

  async handle(event: UserDisabledSessionUserAgentLoggingEvent): Promise<void> {
    await this.sessionRepository.clearUserAgentByUserUuid(event.payload.userUuid)
    await this.revokedSessionRepository.clearUserAgentByUserUuid(event.payload.userUuid)
  }
}
