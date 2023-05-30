import { ItemSaveValidationDTO } from '../SaveValidator/ItemSaveValidationDTO'
import { ItemSaveRuleResult } from './ItemSaveRuleResult'
import { ItemSaveRuleInterface } from './ItemSaveRuleInterface'
import { VaultUserServiceInterface } from '../../VaultUser/Service/VaultUserServiceInterface'
import { ItemHash } from '../ItemHash'
import { VaultUserPermission } from '../../VaultUser/Model/VaultUserPermission'
import { VaultServiceInterface } from '../../Vault/Service/VaultServiceInterface'
import { ContentType } from '@standardnotes/common'
import { ConflictType } from '../../../Tmp/ConflictType'
import {
  VaultSaveOperation,
  AddToVaultSaveOperation,
  RemoveFromVaultSaveOperation,
  MoveToOtherVaultSaveOperation,
  SaveToVaultSaveOperation,
  CreateToVaultSaveOperation,
} from './VaultSaveOperation'
import { Item } from '../Item'

export class VaultFilter implements ItemSaveRuleInterface {
  constructor(private vaultService: VaultServiceInterface, private vaultUserService: VaultUserServiceInterface) {}

  async check(dto: ItemSaveValidationDTO): Promise<ItemSaveRuleResult> {
    if (!dto.existingItem?.vaultUuid && !dto.itemHash.vault_uuid) {
      return {
        passed: true,
      }
    }

    const operation = this.getSaveOperationType(dto)
    return this.getResultForOperation(operation)
  }

  private async getResultForOperation(operation: VaultSaveOperation): Promise<ItemSaveRuleResult> {
    if (operation.type === 'add-to-vault') {
      return this.handleAddToVaultOperation(operation)
    } else if (operation.type === 'remove-from-vault') {
      return this.handleRemoveFromVaultOperation(operation)
    } else if (operation.type === 'move-to-other-vault') {
      return this.handleMoveToOtherVaultOperation(operation)
    } else if (operation.type === 'save-to-vault') {
      return this.handleSaveToVaultOperation(operation)
    } else if (operation.type === 'create-to-vault') {
      return this.handleCreateToVaultOperation(operation)
    }

    throw new Error(`Unsupported vault operation: ${operation}`)
  }

  private getSaveOperationType(dto: ItemSaveValidationDTO): VaultSaveOperation {
    const existingItemVaultUuid = dto.existingItem?.vaultUuid
    const targetItemVaultUuid = dto.itemHash.vault_uuid

    const common = {
      incomingItem: dto.itemHash,
      userUuid: dto.userUuid,
    }

    if (
      dto.existingItem &&
      existingItemVaultUuid &&
      targetItemVaultUuid &&
      existingItemVaultUuid !== targetItemVaultUuid
    ) {
      return {
        type: 'move-to-other-vault',
        sourceVaultUuid: existingItemVaultUuid,
        targetVaultUuid: targetItemVaultUuid,
        existingItem: dto.existingItem,
        ...common,
      }
    }

    if (dto.existingItem && existingItemVaultUuid && !targetItemVaultUuid) {
      return {
        type: 'remove-from-vault',
        vaultUuid: existingItemVaultUuid,
        existingItem: dto.existingItem,
        ...common,
      }
    }

    if (dto.existingItem && !existingItemVaultUuid && targetItemVaultUuid) {
      return {
        type: 'add-to-vault',
        vaultUuid: targetItemVaultUuid,
        existingItem: dto.existingItem,
        ...common,
      }
    }

    if (dto.existingItem && existingItemVaultUuid && existingItemVaultUuid === targetItemVaultUuid) {
      return {
        type: 'save-to-vault',
        vaultUuid: existingItemVaultUuid,
        existingItem: dto.existingItem,
        ...common,
      }
    }

    if (!dto.existingItem && targetItemVaultUuid) {
      return {
        type: 'create-to-vault',
        vaultUuid: targetItemVaultUuid,
        ...common,
      }
    }

    throw new Error('Invalid save operation')
  }

  private isAuthorizedToSaveContentType(contentType: ContentType, permissions: VaultUserPermission): boolean {
    if (contentType === ContentType.VaultItemsKey) {
      return permissions === 'admin'
    }

    return true
  }

  private buildFailResult(operation: VaultSaveOperation, type: ConflictType, serverItem?: Item) {
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

  private async handleAddToVaultOperation(operation: AddToVaultSaveOperation): Promise<ItemSaveRuleResult> {
    const vaultPermissions = await this.getVaultPermissions(operation.userUuid, operation.vaultUuid)
    if (!vaultPermissions) {
      return this.buildFailResult(operation, ConflictType.VaultNotMemberError)
    }

    if (operation.existingItem.deleted || operation.incomingItem.deleted) {
      return this.buildFailResult(operation, ConflictType.VaultInvalidState)
    }

    if (!this.isAuthorizedToSaveContentType(operation.incomingItem.content_type, vaultPermissions)) {
      return this.buildFailResult(operation, ConflictType.VaultInsufficientPermissionsError)
    }

    if (vaultPermissions === 'read') {
      return this.buildFailResult(operation, ConflictType.VaultInsufficientPermissionsError)
    }

    if (operation.existingItem.userUuid !== operation.userUuid) {
      return this.buildFailResult(operation, ConflictType.UuidConflict)
    }

    const usesValidKey = await this.incomingItemUsesValidItemsKey(operation.incomingItem)
    if (!usesValidKey) {
      return this.buildFailResult(operation, ConflictType.VaultInvalidItemsKey, operation.existingItem)
    }

    return this.buildSuccessValue()
  }

  private async handleRemoveFromVaultOperation(operation: RemoveFromVaultSaveOperation): Promise<ItemSaveRuleResult> {
    const vaultPermissions = await this.getVaultPermissions(operation.userUuid, operation.vaultUuid)
    if (!vaultPermissions) {
      return this.buildFailResult(operation, ConflictType.VaultNotMemberError)
    }

    if (operation.existingItem.deleted || operation.incomingItem.deleted) {
      return this.buildFailResult(operation, ConflictType.VaultInvalidState)
    }

    if (operation.existingItem.userUuid === operation.userUuid) {
      return this.buildSuccessValue()
    }

    if (!this.isAuthorizedToSaveContentType(operation.incomingItem.content_type, vaultPermissions)) {
      return this.buildFailResult(operation, ConflictType.VaultInsufficientPermissionsError)
    }

    if (vaultPermissions === 'read') {
      return this.buildFailResult(operation, ConflictType.VaultInsufficientPermissionsError)
    }

    const usesValidKey = await this.incomingItemUsesValidItemsKey(operation.incomingItem)
    if (!usesValidKey) {
      return this.buildFailResult(operation, ConflictType.VaultInvalidItemsKey, operation.existingItem)
    }

    return this.buildSuccessValue()
  }

  private async handleMoveToOtherVaultOperation(operation: MoveToOtherVaultSaveOperation): Promise<ItemSaveRuleResult> {
    const sourceVaultPermissions = await this.getVaultPermissions(operation.userUuid, operation.sourceVaultUuid)
    const targetVaultPermissions = await this.getVaultPermissions(operation.userUuid, operation.targetVaultUuid)

    if (!sourceVaultPermissions || !targetVaultPermissions) {
      return this.buildFailResult(operation, ConflictType.VaultNotMemberError)
    }

    if (operation.existingItem.deleted || operation.incomingItem.deleted) {
      return this.buildFailResult(operation, ConflictType.VaultInvalidState)
    }

    if (sourceVaultPermissions === 'read' || targetVaultPermissions === 'read') {
      return this.buildFailResult(operation, ConflictType.VaultInsufficientPermissionsError)
    }

    if (
      !this.isAuthorizedToSaveContentType(operation.incomingItem.content_type, sourceVaultPermissions) ||
      !this.isAuthorizedToSaveContentType(operation.incomingItem.content_type, targetVaultPermissions)
    ) {
      return this.buildFailResult(operation, ConflictType.VaultInsufficientPermissionsError)
    }

    const usesValidKey = await this.incomingItemUsesValidItemsKey(operation.incomingItem)
    if (!usesValidKey) {
      return this.buildFailResult(operation, ConflictType.VaultInvalidItemsKey, operation.existingItem)
    }

    return this.buildSuccessValue()
  }

  private async handleSaveToVaultOperation(operation: SaveToVaultSaveOperation): Promise<ItemSaveRuleResult> {
    const vaultPermissions = await this.getVaultPermissions(operation.userUuid, operation.vaultUuid)

    if (!vaultPermissions) {
      return this.buildFailResult(operation, ConflictType.VaultNotMemberError)
    }

    if (!this.isAuthorizedToSaveContentType(operation.incomingItem.content_type, vaultPermissions)) {
      return this.buildFailResult(operation, ConflictType.VaultInsufficientPermissionsError)
    }

    if (vaultPermissions === 'read') {
      return this.buildFailResult(operation, ConflictType.VaultInsufficientPermissionsError)
    }

    const usesValidKey = await this.incomingItemUsesValidItemsKey(operation.incomingItem)
    if (!usesValidKey) {
      return this.buildFailResult(operation, ConflictType.VaultInvalidItemsKey, operation.existingItem)
    }

    return this.buildSuccessValue()
  }

  private async handleCreateToVaultOperation(operation: CreateToVaultSaveOperation): Promise<ItemSaveRuleResult> {
    const vaultPermissions = await this.getVaultPermissions(operation.userUuid, operation.vaultUuid)

    if (!vaultPermissions) {
      return this.buildFailResult(operation, ConflictType.VaultNotMemberError)
    }

    if (!this.isAuthorizedToSaveContentType(operation.incomingItem.content_type, vaultPermissions)) {
      return this.buildFailResult(operation, ConflictType.VaultInsufficientPermissionsError)
    }

    if (vaultPermissions === 'read') {
      return this.buildFailResult(operation, ConflictType.VaultInsufficientPermissionsError)
    }

    const usesValidKey = await this.incomingItemUsesValidItemsKey(operation.incomingItem)
    if (!usesValidKey) {
      return this.buildFailResult(operation, ConflictType.VaultInvalidItemsKey)
    }

    return this.buildSuccessValue()
  }

  private async incomingItemUsesValidItemsKey(itemHash: ItemHash): Promise<boolean> {
    const isItemNotEncryptedByItemsKey = itemHash.content_type === ContentType.VaultItemsKey
    if (isItemNotEncryptedByItemsKey) {
      return true
    }

    const vault = await this.vaultService.getVault({ vaultUuid: itemHash.vault_uuid as string })

    if (!vault) {
      return false
    }

    return itemHash.items_key_id === vault.specifiedItemsKeyUuid
  }

  private async getVaultPermissions(userUuid: string, vaultUuid: string): Promise<VaultUserPermission | undefined> {
    const vaultUser = await this.vaultUserService.getUserForVault({
      userUuid,
      vaultUuid: vaultUuid,
    })

    if (vaultUser) {
      return vaultUser.permissions
    }

    return undefined
  }
}
