import { AccountDeletionRequestedEvent, DomainEventHandlerInterface } from '@standardnotes/domain-events'
import { Uuid } from '@standardnotes/domain-core'
import { Logger } from 'winston'

import { DeleteSharedVaults } from '../UseCase/SharedVaults/DeleteSharedVaults/DeleteSharedVaults'
import { RemoveUserFromSharedVaults } from '../UseCase/SharedVaults/RemoveUserFromSharedVaults/RemoveUserFromSharedVaults'
import { ItemRepositoryInterface } from '../Item/ItemRepositoryInterface'

export class AccountDeletionRequestedEventHandler implements DomainEventHandlerInterface {
  constructor(
    private itemRepository: ItemRepositoryInterface,
    private deleteSharedVaults: DeleteSharedVaults,
    private removeUserFromSharedVaults: RemoveUserFromSharedVaults,
    private logger: Logger,
  ) {}

  async handle(event: AccountDeletionRequestedEvent): Promise<void> {
    const userUuidOrError = Uuid.create(event.payload.userUuid)
    if (userUuidOrError.isFailed()) {
      this.logger.error(userUuidOrError.getError(), {
        userId: event.payload.userUuid,
        codeTag: 'AccountDeletionRequestedEventHandler',
      })

      return
    }
    const userUuid = userUuidOrError.getValue()

    await this.itemRepository.deleteByUserUuidAndNotInSharedVault(userUuid)

    const deletingVaultsResult = await this.deleteSharedVaults.execute({
      ownerUuid: event.payload.userUuid,
      allowSurviving: true,
    })
    if (deletingVaultsResult.isFailed()) {
      this.logger.error(`Failed to delete shared vaults: ${deletingVaultsResult.getError()}`, {
        userId: event.payload.userUuid,
      })
    }

    const deletedSharedVaultUuids = Array.from(deletingVaultsResult.getValue().keys())

    this.logger.debug(
      `Deleting items from shared vaults: ${deletedSharedVaultUuids.map((uuid) => uuid.value).join(', ')}`,
    )

    if (deletedSharedVaultUuids.length !== 0) {
      await this.itemRepository.deleteByUserUuidInSharedVaults(userUuid, deletedSharedVaultUuids)
    }

    const deletingUserFromOtherVaultsResult = await this.removeUserFromSharedVaults.execute({
      userUuid: event.payload.userUuid,
    })
    if (deletingUserFromOtherVaultsResult.isFailed()) {
      this.logger.error(`Failed to remove user from shared vaults: ${deletingUserFromOtherVaultsResult.getError()}`, {
        userId: event.payload.userUuid,
      })
    }

    this.logger.info('Finished account cleanup', {
      userId: event.payload.userUuid,
    })
  }
}
