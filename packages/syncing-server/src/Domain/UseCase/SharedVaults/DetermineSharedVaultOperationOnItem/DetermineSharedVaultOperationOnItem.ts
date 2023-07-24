import { Result, UseCaseInterface, Uuid } from '@standardnotes/domain-core'

import { SharedVaultOperationOnItem } from '../../../SharedVault/SharedVaultOperationOnItem'
import { DetermineSharedVaultOperationOnItemDTO } from './DetermineSharedVaultOperationOnItemDTO'
import { Item } from '../../../Item/Item'

export class DetermineSharedVaultOperationOnItem implements UseCaseInterface<SharedVaultOperationOnItem> {
  async execute(dto: DetermineSharedVaultOperationOnItemDTO): Promise<Result<SharedVaultOperationOnItem>> {
    const userUuidOrError = Uuid.create(dto.userUuid)
    if (userUuidOrError.isFailed()) {
      return Result.fail(userUuidOrError.getError())
    }
    const userUuid = userUuidOrError.getValue()

    let existingItemSharedVaultUuid = null
    if (dto.existingItem) {
      existingItemSharedVaultUuid = dto.existingItem.sharedVaultUuid
    }
    const targetItemSharedVaultUuid = dto.itemHash.sharedVaultUuid

    if (!existingItemSharedVaultUuid && !targetItemSharedVaultUuid) {
      return Result.fail('Invalid save operation')
    }

    const isMovingToOtherSharedVault =
      dto.existingItem &&
      existingItemSharedVaultUuid &&
      targetItemSharedVaultUuid &&
      !existingItemSharedVaultUuid.equals(targetItemSharedVaultUuid)
    const isRemovingFromSharedVault = dto.existingItem && existingItemSharedVaultUuid && !targetItemSharedVaultUuid
    const isAddingToSharedVault = dto.existingItem && !existingItemSharedVaultUuid && targetItemSharedVaultUuid
    const isSavingToSharedVault =
      dto.existingItem &&
      existingItemSharedVaultUuid &&
      targetItemSharedVaultUuid &&
      existingItemSharedVaultUuid.equals(targetItemSharedVaultUuid)

    let operationOrError: Result<SharedVaultOperationOnItem>
    if (isMovingToOtherSharedVault) {
      operationOrError = SharedVaultOperationOnItem.create({
        existingItem: dto.existingItem as Item,
        sharedVaultUuid: (existingItemSharedVaultUuid as Uuid).value,
        targetSharedVaultUuid: targetItemSharedVaultUuid.value,
        incomingItemHash: dto.itemHash,
        userUuid: userUuid.value,
        type: SharedVaultOperationOnItem.TYPES.MoveToOtherSharedVault,
      })
    } else if (isRemovingFromSharedVault) {
      operationOrError = SharedVaultOperationOnItem.create({
        existingItem: dto.existingItem as Item,
        sharedVaultUuid: (existingItemSharedVaultUuid as Uuid).value,
        incomingItemHash: dto.itemHash,
        userUuid: userUuid.value,
        type: SharedVaultOperationOnItem.TYPES.RemoveFromSharedVault,
      })
    } else if (isAddingToSharedVault) {
      operationOrError = SharedVaultOperationOnItem.create({
        existingItem: dto.existingItem as Item,
        sharedVaultUuid: targetItemSharedVaultUuid.value,
        incomingItemHash: dto.itemHash,
        userUuid: userUuid.value,
        type: SharedVaultOperationOnItem.TYPES.AddToSharedVault,
      })
    } else if (isSavingToSharedVault) {
      operationOrError = SharedVaultOperationOnItem.create({
        existingItem: dto.existingItem as Item,
        sharedVaultUuid: (existingItemSharedVaultUuid as Uuid).value,
        incomingItemHash: dto.itemHash,
        userUuid: userUuid.value,
        type: SharedVaultOperationOnItem.TYPES.SaveToSharedVault,
      })
    } else {
      operationOrError = SharedVaultOperationOnItem.create({
        sharedVaultUuid: (targetItemSharedVaultUuid as Uuid).value,
        incomingItemHash: dto.itemHash,
        userUuid: userUuid.value,
        type: SharedVaultOperationOnItem.TYPES.CreateToSharedVault,
      })
    }

    if (operationOrError.isFailed()) {
      return Result.fail(operationOrError.getError())
    }

    return Result.ok(operationOrError.getValue())
  }
}
