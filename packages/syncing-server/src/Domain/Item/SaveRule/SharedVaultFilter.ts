import { ItemSaveValidationDTO } from '../SaveValidator/ItemSaveValidationDTO'
import { ItemSaveRuleResult } from './ItemSaveRuleResult'
import { ItemSaveRuleInterface } from './ItemSaveRuleInterface'
import { SharedVaultUserServiceInterface } from '../../SharedVaultUser/Service/SharedVaultUserServiceInterface'
import { ItemHash } from '../ItemHash'
import { SharedVaultUserPermission } from '../../SharedVaultUser/Model/SharedVaultUserPermission'
import { SharedVaultServiceInterface } from '../../SharedVault/Service/SharedVaultServiceInterface'
import { ContentType } from '@standardnotes/common'
import { ConflictType } from '../../../Tmp/ConflictType'
import {
  SharedVaultSaveOperation,
  AddToSharedVaultSaveOperation,
  RemoveFromSharedVaultSaveOperation,
  MoveToOtherSharedVaultSaveOperation,
  SaveToSharedVaultSaveOperation,
  CreateToSharedVaultSaveOperation,
} from './SharedVaultSaveOperation'
import { Item } from '../Item'
import { GetSaveOperation } from './GetSaveOperationType'

export class SharedVaultFilter implements ItemSaveRuleInterface {
  constructor(
    private sharedvaultService: SharedVaultServiceInterface,
    private sharedvaultUserService: SharedVaultUserServiceInterface,
  ) {}

  async check(dto: ItemSaveValidationDTO): Promise<ItemSaveRuleResult> {
    if (!dto.existingItem?.sharedVaultUuid && !dto.itemHash.shared_vault_uuid) {
      return {
        passed: true,
      }
    }

    const operation = GetSaveOperation(dto)

    if (dto.itemHash.shared_vault_uuid && !dto.itemHash.key_system_identifier) {
      return this.buildFailResult(operation, ConflictType.SharedVaultInvalidState)
    }

    return this.getResultForOperation(operation)
  }

  private async getResultForOperation(operation: SharedVaultSaveOperation): Promise<ItemSaveRuleResult> {
    if (operation.type === 'add-to-shared-vault') {
      return this.handleAddToSharedVaultOperation(operation)
    } else if (operation.type === 'remove-from-shared-vault') {
      return this.handleRemoveFromSharedVaultOperation(operation)
    } else if (operation.type === 'move-to-other-shared-vault') {
      return this.handleMoveToOtherSharedVaultOperation(operation)
    } else if (operation.type === 'save-to-shared-vault') {
      return this.handleSaveToSharedVaultOperation(operation)
    } else if (operation.type === 'create-to-shared-vault') {
      return this.handleCreateToSharedVaultOperation(operation)
    }

    throw new Error(`Unsupported sharedvault operation: ${operation}`)
  }

  private isAuthorizedToSaveContentType(contentType: ContentType, permissions: SharedVaultUserPermission): boolean {
    if (contentType === ContentType.KeySystemItemsKey) {
      return permissions === 'admin'
    }

    return true
  }

  private buildFailResult(operation: SharedVaultSaveOperation, type: ConflictType, serverItem?: Item) {
    return {
      passed: false,
      conflict: {
        unsavedItem: operation.incomingItem,
        serverItem,
        type,
      },
    }
  }

  private buildSuccessValue(): ItemSaveRuleResult {
    return {
      passed: true,
    }
  }

  private async handleAddToSharedVaultOperation(operation: AddToSharedVaultSaveOperation): Promise<ItemSaveRuleResult> {
    const sharedvaultPermissions = await this.getSharedVaultPermissions(operation.userUuid, operation.sharedVaultUuid)
    if (!sharedvaultPermissions) {
      return this.buildFailResult(operation, ConflictType.SharedVaultNotMemberError)
    }

    if (operation.existingItem.deleted || operation.incomingItem.deleted) {
      return this.buildFailResult(operation, ConflictType.SharedVaultInvalidState)
    }

    if (!this.isAuthorizedToSaveContentType(operation.incomingItem.content_type, sharedvaultPermissions)) {
      return this.buildFailResult(operation, ConflictType.SharedVaultInsufficientPermissionsError)
    }

    if (sharedvaultPermissions === 'read') {
      return this.buildFailResult(operation, ConflictType.SharedVaultInsufficientPermissionsError)
    }

    if (operation.existingItem.userUuid !== operation.userUuid) {
      return this.buildFailResult(operation, ConflictType.UuidConflict)
    }

    const usesValidKey = await this.incomingItemUsesValidItemsKey(operation.incomingItem)
    if (!usesValidKey) {
      return this.buildFailResult(operation, ConflictType.SharedVaultInvalidItemsKey, operation.existingItem)
    }

    return this.buildSuccessValue()
  }

  private async handleRemoveFromSharedVaultOperation(
    operation: RemoveFromSharedVaultSaveOperation,
  ): Promise<ItemSaveRuleResult> {
    const sharedvaultPermissions = await this.getSharedVaultPermissions(operation.userUuid, operation.sharedVaultUuid)
    if (!sharedvaultPermissions) {
      return this.buildFailResult(operation, ConflictType.SharedVaultNotMemberError)
    }

    if (operation.existingItem.deleted || operation.incomingItem.deleted) {
      return this.buildFailResult(operation, ConflictType.SharedVaultInvalidState)
    }

    if (operation.existingItem.userUuid === operation.userUuid) {
      return this.buildSuccessValue()
    }

    if (!this.isAuthorizedToSaveContentType(operation.incomingItem.content_type, sharedvaultPermissions)) {
      return this.buildFailResult(operation, ConflictType.SharedVaultInsufficientPermissionsError)
    }

    if (sharedvaultPermissions === 'read') {
      return this.buildFailResult(operation, ConflictType.SharedVaultInsufficientPermissionsError)
    }

    const usesValidKey = await this.incomingItemUsesValidItemsKey(operation.incomingItem)
    if (!usesValidKey) {
      return this.buildFailResult(operation, ConflictType.SharedVaultInvalidItemsKey, operation.existingItem)
    }

    return this.buildSuccessValue()
  }

  private async handleMoveToOtherSharedVaultOperation(
    operation: MoveToOtherSharedVaultSaveOperation,
  ): Promise<ItemSaveRuleResult> {
    const sourceSharedVaultPermissions = await this.getSharedVaultPermissions(
      operation.userUuid,
      operation.sharedVaultUuid,
    )
    const targetSharedVaultPermissions = await this.getSharedVaultPermissions(
      operation.userUuid,
      operation.targetSharedVaultUuid,
    )

    if (!sourceSharedVaultPermissions || !targetSharedVaultPermissions) {
      return this.buildFailResult(operation, ConflictType.SharedVaultNotMemberError)
    }

    if (operation.existingItem.deleted || operation.incomingItem.deleted) {
      return this.buildFailResult(operation, ConflictType.SharedVaultInvalidState)
    }

    if (sourceSharedVaultPermissions === 'read' || targetSharedVaultPermissions === 'read') {
      return this.buildFailResult(operation, ConflictType.SharedVaultInsufficientPermissionsError)
    }

    if (
      !this.isAuthorizedToSaveContentType(operation.incomingItem.content_type, sourceSharedVaultPermissions) ||
      !this.isAuthorizedToSaveContentType(operation.incomingItem.content_type, targetSharedVaultPermissions)
    ) {
      return this.buildFailResult(operation, ConflictType.SharedVaultInsufficientPermissionsError)
    }

    const usesValidKey = await this.incomingItemUsesValidItemsKey(operation.incomingItem)
    if (!usesValidKey) {
      return this.buildFailResult(operation, ConflictType.SharedVaultInvalidItemsKey, operation.existingItem)
    }

    return this.buildSuccessValue()
  }

  private async handleSaveToSharedVaultOperation(
    operation: SaveToSharedVaultSaveOperation,
  ): Promise<ItemSaveRuleResult> {
    const sharedvaultPermissions = await this.getSharedVaultPermissions(operation.userUuid, operation.sharedVaultUuid)

    if (!sharedvaultPermissions) {
      return this.buildFailResult(operation, ConflictType.SharedVaultNotMemberError)
    }

    if (!this.isAuthorizedToSaveContentType(operation.incomingItem.content_type, sharedvaultPermissions)) {
      return this.buildFailResult(operation, ConflictType.SharedVaultInsufficientPermissionsError)
    }

    if (sharedvaultPermissions === 'read') {
      return this.buildFailResult(operation, ConflictType.SharedVaultInsufficientPermissionsError)
    }

    const usesValidKey = await this.incomingItemUsesValidItemsKey(operation.incomingItem)
    if (!usesValidKey) {
      return this.buildFailResult(operation, ConflictType.SharedVaultInvalidItemsKey, operation.existingItem)
    }

    return this.buildSuccessValue()
  }

  private async handleCreateToSharedVaultOperation(
    operation: CreateToSharedVaultSaveOperation,
  ): Promise<ItemSaveRuleResult> {
    const sharedvaultPermissions = await this.getSharedVaultPermissions(operation.userUuid, operation.sharedVaultUuid)

    if (!sharedvaultPermissions) {
      return this.buildFailResult(operation, ConflictType.SharedVaultNotMemberError)
    }

    if (!this.isAuthorizedToSaveContentType(operation.incomingItem.content_type, sharedvaultPermissions)) {
      return this.buildFailResult(operation, ConflictType.SharedVaultInsufficientPermissionsError)
    }

    if (sharedvaultPermissions === 'read') {
      return this.buildFailResult(operation, ConflictType.SharedVaultInsufficientPermissionsError)
    }

    const usesValidKey = await this.incomingItemUsesValidItemsKey(operation.incomingItem)
    if (!usesValidKey) {
      return this.buildFailResult(operation, ConflictType.SharedVaultInvalidItemsKey)
    }

    return this.buildSuccessValue()
  }

  private async incomingItemUsesValidItemsKey(itemHash: ItemHash): Promise<boolean> {
    const isItemNotEncryptedByItemsKey = itemHash.content_type === ContentType.KeySystemItemsKey
    if (isItemNotEncryptedByItemsKey) {
      return true
    }

    const sharedvault = await this.sharedvaultService.getSharedVault({
      sharedVaultUuid: itemHash.shared_vault_uuid as string,
    })

    if (!sharedvault) {
      return false
    }

    return itemHash.items_key_id === sharedvault.specifiedItemsKeyUuid
  }

  private async getSharedVaultPermissions(
    userUuid: string,
    sharedVaultUuid: string,
  ): Promise<SharedVaultUserPermission | undefined> {
    const sharedvaultUser = await this.sharedvaultUserService.getUserForSharedVault({
      userUuid,
      sharedVaultUuid: sharedVaultUuid,
    })

    if (sharedvaultUser) {
      return sharedvaultUser.permissions
    }

    return undefined
  }
}
