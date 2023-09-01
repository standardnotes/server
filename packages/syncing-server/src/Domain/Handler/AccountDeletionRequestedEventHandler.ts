import { AccountDeletionRequestedEvent, DomainEventHandlerInterface } from '@standardnotes/domain-events'
import { RoleNameCollection } from '@standardnotes/domain-core'
import { Logger } from 'winston'

import { ItemRepositoryResolverInterface } from '../Item/ItemRepositoryResolverInterface'

export class AccountDeletionRequestedEventHandler implements DomainEventHandlerInterface {
  constructor(
    private itemRepositoryResolver: ItemRepositoryResolverInterface,
    private logger: Logger,
  ) {}

  async handle(event: AccountDeletionRequestedEvent): Promise<void> {
    const roleNamesOrError = RoleNameCollection.create(event.payload.roleNames)
    if (roleNamesOrError.isFailed()) {
      return
    }
    const roleNames = roleNamesOrError.getValue()

    const itemRepository = this.itemRepositoryResolver.resolve(roleNames)

    await itemRepository.deleteByUserUuid(event.payload.userUuid)

    this.logger.info(`Finished account cleanup for user: ${event.payload.userUuid}`)
  }
}
