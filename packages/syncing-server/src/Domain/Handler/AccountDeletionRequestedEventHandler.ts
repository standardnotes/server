import { AccountDeletionRequestedEvent, DomainEventHandlerInterface } from '@standardnotes/domain-events'
import { RoleNameCollection } from '@standardnotes/domain-core'
import { Logger } from 'winston'

import { ItemRepositoryResolverInterface } from '../Item/ItemRepositoryResolverInterface'
import { DeleteSharedVaults } from '../UseCase/SharedVaults/DeleteSharedVaults/DeleteSharedVaults'
import { RemoveUserFromSharedVaults } from '../UseCase/SharedVaults/RemoveUserFromSharedVaults/RemoveUserFromSharedVaults'

export class AccountDeletionRequestedEventHandler implements DomainEventHandlerInterface {
  constructor(
    private itemRepositoryResolver: ItemRepositoryResolverInterface,
    private deleteSharedVaults: DeleteSharedVaults,
    private removeUserFromSharedVaults: RemoveUserFromSharedVaults,
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

    const deletingVaultsResult = await this.deleteSharedVaults.execute({
      ownerUuid: event.payload.userUuid,
    })
    if (deletingVaultsResult.isFailed()) {
      this.logger.error(
        `Failed to delete shared vaults for user: ${event.payload.userUuid}: ${deletingVaultsResult.getError()}`,
      )
    }

    const deletingUserFromOtherVaultsResult = await this.removeUserFromSharedVaults.execute({
      userUuid: event.payload.userUuid,
    })
    if (deletingUserFromOtherVaultsResult.isFailed()) {
      this.logger.error(
        `Failed to remove user: ${
          event.payload.userUuid
        } from shared vaults: ${deletingUserFromOtherVaultsResult.getError()}`,
      )
    }

    this.logger.info(`Finished account cleanup for user: ${event.payload.userUuid}`)
  }
}
