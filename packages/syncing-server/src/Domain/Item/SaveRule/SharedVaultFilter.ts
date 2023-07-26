import { ConflictType } from '@standardnotes/responses'
import { ContentType, Result, SharedVaultUserPermission, Uuid } from '@standardnotes/domain-core'

import { ItemSaveValidationDTO } from '../SaveValidator/ItemSaveValidationDTO'
import { ItemSaveRuleResult } from './ItemSaveRuleResult'
import { ItemSaveRuleInterface } from './ItemSaveRuleInterface'
import { DetermineSharedVaultOperationOnItem } from '../../UseCase/SharedVaults/DetermineSharedVaultOperationOnItem/DetermineSharedVaultOperationOnItem'
import { SharedVaultOperationOnItem } from '../../SharedVault/SharedVaultOperationOnItem'
import { SharedVaultUserRepositoryInterface } from '../../SharedVault/User/SharedVaultUserRepositoryInterface'

export class SharedVaultFilter implements ItemSaveRuleInterface {
  constructor(
    private determineSharedVaultOperationOnItem: DetermineSharedVaultOperationOnItem,
    private sharedVaultUserRepository: SharedVaultUserRepositoryInterface,
  ) {}

  async check(dto: ItemSaveValidationDTO): Promise<ItemSaveRuleResult> {
    if (!dto.itemHash.representsASharedVaultItem() && !dto.existingItem?.isAssociatedWithASharedVault()) {
      return {
        passed: true,
      }
    }

    const operationOrError = await this.determineSharedVaultOperationOnItem.execute({
      userUuid: dto.userUuid,
      itemHash: dto.itemHash,
      existingItem: dto.existingItem,
    })
    if (operationOrError.isFailed()) {
      return {
        passed: false,
        conflict: {
          unsavedItem: dto.itemHash,
          type: ConflictType.SharedVaultInvalidState,
        },
      }
    }
    const operation = operationOrError.getValue()

    if (dto.itemHash.representsASharedVaultItem() && !dto.itemHash.hasDedicatedKeySystemAssociation()) {
      return this.buildFailResult(operation, ConflictType.SharedVaultInvalidState)
    }

    const sharedVaultPermission = await this.getSharedVaultUserPermission(
      operation.props.userUuid,
      operation.props.sharedVaultUuid,
    )

    if (!sharedVaultPermission) {
      return this.buildFailResult(operation, ConflictType.SharedVaultNotMemberError)
    }

    let targetSharedVaultPermission: SharedVaultUserPermission | null = null
    if (operation.props.targetSharedVaultUuid) {
      targetSharedVaultPermission = await this.getSharedVaultUserPermission(
        operation.props.userUuid,
        operation.props.targetSharedVaultUuid,
      )

      if (!targetSharedVaultPermission) {
        return this.buildFailResult(operation, ConflictType.SharedVaultNotMemberError)
      }
    }

    const resultOrError = await this.getResultForOperation(
      operation,
      sharedVaultPermission,
      targetSharedVaultPermission,
    )
    /* istanbul ignore next */
    if (resultOrError.isFailed()) {
      return this.buildFailResult(operation, ConflictType.SharedVaultInvalidState)
    }

    return resultOrError.getValue()
  }

  private async getResultForOperation(
    operation: SharedVaultOperationOnItem,
    sharedVaultPermission: SharedVaultUserPermission,
    targetSharedVaultPermission: SharedVaultUserPermission | null,
  ): Promise<Result<ItemSaveRuleResult>> {
    switch (operation.props.type) {
      case SharedVaultOperationOnItem.TYPES.AddToSharedVault:
      case SharedVaultOperationOnItem.TYPES.RemoveFromSharedVault:
        return Result.ok(await this.handleAddOrRemoveToSharedVaultOperation(operation, sharedVaultPermission))
      case SharedVaultOperationOnItem.TYPES.MoveToOtherSharedVault:
        return Result.ok(
          await this.handleMoveToOtherSharedVaultOperation(
            operation,
            sharedVaultPermission,
            targetSharedVaultPermission as SharedVaultUserPermission,
          ),
        )
      case SharedVaultOperationOnItem.TYPES.SaveToSharedVault:
      case SharedVaultOperationOnItem.TYPES.CreateToSharedVault:
        return Result.ok(await this.handleSaveOrCreateToSharedVaultOperation(operation, sharedVaultPermission))
      /* istanbul ignore next */
      default:
        return Result.fail(`Unsupported sharedVault operation: ${operation}`)
    }
  }

  private isAuthorizedToSaveContentType(contentType: string | null, permission: SharedVaultUserPermission): boolean {
    if (contentType === ContentType.TYPES.KeySystemItemsKey) {
      return permission.value === SharedVaultUserPermission.PERMISSIONS.Admin
    }

    return true
  }

  private async handleAddOrRemoveToSharedVaultOperation(
    operation: SharedVaultOperationOnItem,
    sharedVaultPermission: SharedVaultUserPermission,
  ): Promise<ItemSaveRuleResult> {
    if (this.isItemDeletedOrBeingDeleted(operation)) {
      return this.buildFailResult(operation, ConflictType.SharedVaultInvalidState)
    }

    if (!this.isOwnerOfTheItem(operation)) {
      return this.buildFailResult(operation, ConflictType.SharedVaultInsufficientPermissionsError)
    }

    if (!this.hasSufficientPermissionsToWriteInVault(operation, sharedVaultPermission)) {
      return this.buildFailResult(operation, ConflictType.SharedVaultInsufficientPermissionsError)
    }

    return this.buildSuccessValue()
  }

  private async handleMoveToOtherSharedVaultOperation(
    operation: SharedVaultOperationOnItem,
    sourceSharedVaultPermission: SharedVaultUserPermission,
    targetSharedVaultPermission: SharedVaultUserPermission,
  ): Promise<ItemSaveRuleResult> {
    if (this.isItemDeletedOrBeingDeleted(operation)) {
      return this.buildFailResult(operation, ConflictType.SharedVaultInvalidState)
    }

    for (const permission of [sourceSharedVaultPermission, targetSharedVaultPermission]) {
      if (!this.hasSufficientPermissionsToWriteInVault(operation, permission)) {
        return this.buildFailResult(operation, ConflictType.SharedVaultInsufficientPermissionsError)
      }
    }

    return this.buildSuccessValue()
  }

  private async handleSaveOrCreateToSharedVaultOperation(
    operation: SharedVaultOperationOnItem,
    sharedVaultPermission: SharedVaultUserPermission,
  ): Promise<ItemSaveRuleResult> {
    if (!this.hasSufficientPermissionsToWriteInVault(operation, sharedVaultPermission)) {
      return this.buildFailResult(operation, ConflictType.SharedVaultInsufficientPermissionsError)
    }

    return this.buildSuccessValue()
  }

  private isItemDeletedOrBeingDeleted(operation: SharedVaultOperationOnItem): boolean {
    if (operation.props.existingItem?.props.deleted || operation.props.incomingItemHash.props.deleted) {
      return true
    }

    return false
  }

  private isOwnerOfTheItem(operation: SharedVaultOperationOnItem): boolean {
    if (operation.props.userUuid.equals(operation.props.existingItem?.props.userUuid)) {
      return true
    }

    return false
  }

  private hasSufficientPermissionsToWriteInVault(
    operation: SharedVaultOperationOnItem,
    sharedVaultPermission: SharedVaultUserPermission,
  ): boolean {
    if (
      !this.isAuthorizedToSaveContentType(operation.props.incomingItemHash.props.content_type, sharedVaultPermission)
    ) {
      return false
    }

    if (sharedVaultPermission.value === SharedVaultUserPermission.PERMISSIONS.Read) {
      return false
    }

    return true
  }

  private async getSharedVaultUserPermission(
    userUuid: Uuid,
    sharedVaultUuid: Uuid,
  ): Promise<SharedVaultUserPermission | null> {
    const sharedVaultUser = await this.sharedVaultUserRepository.findByUserUuidAndSharedVaultUuid({
      userUuid,
      sharedVaultUuid,
    })

    if (sharedVaultUser) {
      return sharedVaultUser.props.permission
    }

    return null
  }

  private buildFailResult(operation: SharedVaultOperationOnItem, type: ConflictType): ItemSaveRuleResult {
    const includeServerItem = [
      ConflictType.SharedVaultInvalidState,
      ConflictType.SharedVaultInsufficientPermissionsError,
    ].includes(type)

    return {
      passed: false,
      conflict: {
        unsavedItem: operation.props.incomingItemHash,
        serverItem: includeServerItem ? operation.props.existingItem : undefined,
        type,
      },
    }
  }

  private buildSuccessValue(): ItemSaveRuleResult {
    return {
      passed: true,
    }
  }
}
