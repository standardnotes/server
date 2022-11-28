import { Uuid } from '@standardnotes/domain-core'
import { AccountDeletionRequestedEvent, DomainEventHandlerInterface } from '@standardnotes/domain-events'
import { Logger } from 'winston'

import { RevisionRepositoryInterface } from '../Revision/RevisionRepositoryInterface'

export class AccountDeletionRequestedEventHandler implements DomainEventHandlerInterface {
  constructor(private revisionRepository: RevisionRepositoryInterface, private logger: Logger) {}

  async handle(event: AccountDeletionRequestedEvent): Promise<void> {
    const userUuidOrError = Uuid.create(event.payload.userUuid)
    if (userUuidOrError.isFailed()) {
      this.logger.warn(`Failed account cleanup: ${userUuidOrError.getError()}`)

      return
    }
    const userUuid = userUuidOrError.getValue()

    await this.revisionRepository.removeByUserUuid(userUuid)

    this.logger.info(`Finished account cleanup for user: ${event.payload.userUuid}`)
  }
}
