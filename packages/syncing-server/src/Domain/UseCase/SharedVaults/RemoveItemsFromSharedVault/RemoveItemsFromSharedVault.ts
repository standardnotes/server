import { Result, UseCaseInterface, Uuid } from '@standardnotes/domain-core'

import { ItemRepositoryInterface } from '../../../Item/ItemRepositoryInterface'
import { RemoveItemsFromSharedVaultDTO } from './RemoveItemsFromSharedVaultDTO'

export class RemoveItemsFromSharedVault implements UseCaseInterface<void> {
  constructor(private itemRepository: ItemRepositoryInterface) {}

  async execute(dto: RemoveItemsFromSharedVaultDTO): Promise<Result<void>> {
    const sharedVaultUuidOrError = Uuid.create(dto.sharedVaultUuid)
    if (sharedVaultUuidOrError.isFailed()) {
      return Result.fail(sharedVaultUuidOrError.getError())
    }
    const sharedVaultUuid = sharedVaultUuidOrError.getValue()

    await this.itemRepository.unassignFromSharedVault(sharedVaultUuid)

    return Result.ok()
  }
}
