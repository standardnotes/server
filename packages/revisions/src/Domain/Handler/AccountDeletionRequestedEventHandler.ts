import { RoleNameCollection, Uuid } from '@standardnotes/domain-core'
import { AccountDeletionRequestedEvent, DomainEventHandlerInterface } from '@standardnotes/domain-events'
import { Logger } from 'winston'

import { RevisionRepositoryResolverInterface } from '../Revision/RevisionRepositoryResolverInterface'

export class AccountDeletionRequestedEventHandler implements DomainEventHandlerInterface {
  constructor(private revisionRepositoryResolver: RevisionRepositoryResolverInterface, private logger: Logger) {}

  async handle(event: AccountDeletionRequestedEvent): Promise<void> {
    const userUuidOrError = Uuid.create(event.payload.userUuid)
    if (userUuidOrError.isFailed()) {
      this.logger.warn(`Failed account cleanup: ${userUuidOrError.getError()}`)

      return
    }
    const userUuid = userUuidOrError.getValue()

    const roleNamesOrError = RoleNameCollection.create(event.payload.roleNames)
    if (roleNamesOrError.isFailed()) {
      this.logger.error(`Failed account cleanup: ${roleNamesOrError.getError()}`)

      return
    }
    const roleNames = roleNamesOrError.getValue()

    const revisionRepository = this.revisionRepositoryResolver.resolve(roleNames)

    await revisionRepository.removeByUserUuid(userUuid)

    this.logger.info(`Finished account cleanup for user: ${event.payload.userUuid}`)
  }
}
