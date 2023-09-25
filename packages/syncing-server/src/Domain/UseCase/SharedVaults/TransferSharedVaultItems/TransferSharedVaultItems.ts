import { Result, UseCaseInterface, Uuid } from '@standardnotes/domain-core'

import { ItemRepositoryInterface } from '../../../Item/ItemRepositoryInterface'
import { TransferSharedVaultItemsDTO } from './TransferSharedVaultItemsDTO'

export class TransferSharedVaultItems implements UseCaseInterface<void> {
  constructor(private itemRepository: ItemRepositoryInterface) {}

  async execute(dto: TransferSharedVaultItemsDTO): Promise<Result<void>> {
    const fromUserUuidOrError = Uuid.create(dto.fromUserUuid)
    if (fromUserUuidOrError.isFailed()) {
      return Result.fail(fromUserUuidOrError.getError())
    }
    const fromUserUuid = fromUserUuidOrError.getValue()

    const toUserUuidOrError = Uuid.create(dto.toUserUuid)
    if (toUserUuidOrError.isFailed()) {
      return Result.fail(toUserUuidOrError.getError())
    }
    const toUserUuid = toUserUuidOrError.getValue()

    const sharedVaultUuidOrError = Uuid.create(dto.sharedVaultUuid)
    if (sharedVaultUuidOrError.isFailed()) {
      return Result.fail(sharedVaultUuidOrError.getError())
    }
    const sharedVaultUuid = sharedVaultUuidOrError.getValue()

    await this.itemRepository.updateSharedVaultOwner({
      sharedVaultUuid,
      fromOwnerUuid: fromUserUuid,
      toOwnerUuid: toUserUuid,
    })

    return Result.ok()
  }
}
