import { AccountDeletionRequestedEvent, DomainEventHandlerInterface } from '@standardnotes/domain-events'
import { Uuid } from '@standardnotes/domain-core'
import { Logger } from 'winston'

import { EphemeralSessionRepositoryInterface } from '../Session/EphemeralSessionRepositoryInterface'
import { RevokedSessionRepositoryInterface } from '../Session/RevokedSessionRepositoryInterface'
import { SessionRepositoryInterface } from '../Session/SessionRepositoryInterface'
import { UserRepositoryInterface } from '../User/UserRepositoryInterface'

export class AccountDeletionRequestedEventHandler implements DomainEventHandlerInterface {
  constructor(
    private userRepository: UserRepositoryInterface,
    private sessionRepository: SessionRepositoryInterface,
    private ephemeralSessionRepository: EphemeralSessionRepositoryInterface,
    private revokedSessionRepository: RevokedSessionRepositoryInterface,
    private logger: Logger,
  ) {}

  async handle(event: AccountDeletionRequestedEvent): Promise<void> {
    const userUuidOrError = Uuid.create(event.payload.userUuid)
    if (userUuidOrError.isFailed()) {
      this.logger.warn('Could not find user.', { userId: event.payload.userUuid })

      return
    }
    const userUuid = userUuidOrError.getValue()

    const user = await this.userRepository.findOneByUuid(userUuid)

    if (user === null) {
      this.logger.warn('Could not find user.', { userId: userUuid.value })

      return
    }

    await this.removeSessions(userUuid.value)

    await this.userRepository.remove(user)

    this.logger.info('Finished account cleanup.', {
      userId: userUuid.value,
    })
  }

  private async removeSessions(userUuid: string): Promise<void> {
    const sessions = await this.sessionRepository.findAllByUserUuid(userUuid)
    for (const session of sessions) {
      await this.sessionRepository.remove(session)
    }

    const ephemeralSessions = await this.ephemeralSessionRepository.findAllByUserUuid(userUuid)
    for (const ephemeralSession of ephemeralSessions) {
      await this.ephemeralSessionRepository.deleteOne(ephemeralSession.uuid, ephemeralSession.userUuid)
    }

    const revokedSessions = await this.revokedSessionRepository.findAllByUserUuid(userUuid)
    for (const revokedSession of revokedSessions) {
      await this.revokedSessionRepository.remove(revokedSession)
    }
  }
}
