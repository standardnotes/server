import { ItemSaveValidationDTO } from '../SaveValidator/ItemSaveValidationDTO'
import { ItemSaveRuleResult } from './ItemSaveRuleResult'
import { ItemSaveRuleInterface } from './ItemSaveRuleInterface'
import { GroupUserServiceInterface } from '../../GroupUser/Service/GroupUserServiceInterface'
import { ItemHash } from '../ItemHash'
import { GroupUserPermission } from '../../GroupUser/Model/GroupUserPermission'
import { GroupServiceInterface } from '../../Group/Service/GroupServiceInterface'
import { ContentType } from '@standardnotes/common'
import { ConflictType } from '../../../Tmp/ConflictType'
import {
  GroupSaveOperation,
  AddToGroupSaveOperation,
  RemoveFromGroupSaveOperation,
  MoveToOtherGroupSaveOperation,
  SaveToGroupSaveOperation,
  CreateToGroupSaveOperation,
} from './GroupSaveOperation'
import { Item } from '../Item'

export class GroupFilter implements ItemSaveRuleInterface {
  constructor(private groupService: GroupServiceInterface, private groupUserService: GroupUserServiceInterface) {}

  async check(dto: ItemSaveValidationDTO): Promise<ItemSaveRuleResult> {
    if (!dto.existingItem?.groupUuid && !dto.itemHash.group_uuid) {
      return {
        passed: true,
      }
    }

    const operation = this.getSaveOperationType(dto)
    return this.getResultForOperation(operation)
  }

  private async getResultForOperation(operation: GroupSaveOperation): Promise<ItemSaveRuleResult> {
    if (operation.type === 'add-to-group') {
      return this.handleAddToGroupOperation(operation)
    } else if (operation.type === 'remove-from-group') {
      return this.handleRemoveFromGroupOperation(operation)
    } else if (operation.type === 'move-to-other-group') {
      return this.handleMoveToOtherGroupOperation(operation)
    } else if (operation.type === 'save-to-group') {
      return this.handleSaveToGroupOperation(operation)
    } else if (operation.type === 'create-to-group') {
      return this.handleCreateToGroupOperation(operation)
    }

    throw new Error(`Unsupported group operation: ${operation}`)
  }

  private getSaveOperationType(dto: ItemSaveValidationDTO): GroupSaveOperation {
    const existingItemGroupUuid = dto.existingItem?.groupUuid
    const targetItemGroupUuid = dto.itemHash.group_uuid

    const common = {
      incomingItem: dto.itemHash,
      userUuid: dto.userUuid,
    }

    if (
      dto.existingItem &&
      existingItemGroupUuid &&
      targetItemGroupUuid &&
      existingItemGroupUuid !== targetItemGroupUuid
    ) {
      return {
        type: 'move-to-other-group',
        groupUuid: existingItemGroupUuid,
        targetGroupUuid: targetItemGroupUuid,
        existingItem: dto.existingItem,
        ...common,
      }
    }

    if (dto.existingItem && existingItemGroupUuid && !targetItemGroupUuid) {
      return {
        type: 'remove-from-group',
        groupUuid: existingItemGroupUuid,
        existingItem: dto.existingItem,
        ...common,
      }
    }

    if (dto.existingItem && !existingItemGroupUuid && targetItemGroupUuid) {
      return {
        type: 'add-to-group',
        groupUuid: targetItemGroupUuid,
        existingItem: dto.existingItem,
        ...common,
      }
    }

    if (dto.existingItem && existingItemGroupUuid && existingItemGroupUuid === targetItemGroupUuid) {
      return {
        type: 'save-to-group',
        groupUuid: existingItemGroupUuid,
        existingItem: dto.existingItem,
        ...common,
      }
    }

    if (!dto.existingItem && targetItemGroupUuid) {
      return {
        type: 'create-to-group',
        groupUuid: targetItemGroupUuid,
        ...common,
      }
    }

    throw new Error('Invalid save operation')
  }

  private isAuthorizedToSaveContentType(contentType: ContentType, permissions: GroupUserPermission): boolean {
    if (contentType === ContentType.VaultItemsKey) {
      return permissions === 'admin'
    }

    return true
  }

  private buildFailResult(operation: GroupSaveOperation, type: ConflictType, serverItem?: Item) {
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

  private async handleAddToGroupOperation(operation: AddToGroupSaveOperation): Promise<ItemSaveRuleResult> {
    const groupPermissions = await this.getGroupPermissions(operation.userUuid, operation.groupUuid)
    if (!groupPermissions) {
      return this.buildFailResult(operation, ConflictType.GroupNotMemberError)
    }

    if (operation.existingItem.deleted || operation.incomingItem.deleted) {
      return this.buildFailResult(operation, ConflictType.GroupInvalidState)
    }

    if (!this.isAuthorizedToSaveContentType(operation.incomingItem.content_type, groupPermissions)) {
      return this.buildFailResult(operation, ConflictType.GroupInsufficientPermissionsError)
    }

    if (groupPermissions === 'read') {
      return this.buildFailResult(operation, ConflictType.GroupInsufficientPermissionsError)
    }

    if (operation.existingItem.userUuid !== operation.userUuid) {
      return this.buildFailResult(operation, ConflictType.UuidConflict)
    }

    const usesValidKey = await this.incomingItemUsesValidItemsKey(operation.incomingItem)
    if (!usesValidKey) {
      return this.buildFailResult(operation, ConflictType.GroupInvalidItemsKey, operation.existingItem)
    }

    return this.buildSuccessValue()
  }

  private async handleRemoveFromGroupOperation(operation: RemoveFromGroupSaveOperation): Promise<ItemSaveRuleResult> {
    const groupPermissions = await this.getGroupPermissions(operation.userUuid, operation.groupUuid)
    if (!groupPermissions) {
      return this.buildFailResult(operation, ConflictType.GroupNotMemberError)
    }

    if (operation.existingItem.deleted || operation.incomingItem.deleted) {
      return this.buildFailResult(operation, ConflictType.GroupInvalidState)
    }

    if (operation.existingItem.userUuid === operation.userUuid) {
      return this.buildSuccessValue()
    }

    if (!this.isAuthorizedToSaveContentType(operation.incomingItem.content_type, groupPermissions)) {
      return this.buildFailResult(operation, ConflictType.GroupInsufficientPermissionsError)
    }

    if (groupPermissions === 'read') {
      return this.buildFailResult(operation, ConflictType.GroupInsufficientPermissionsError)
    }

    const usesValidKey = await this.incomingItemUsesValidItemsKey(operation.incomingItem)
    if (!usesValidKey) {
      return this.buildFailResult(operation, ConflictType.GroupInvalidItemsKey, operation.existingItem)
    }

    return this.buildSuccessValue()
  }

  private async handleMoveToOtherGroupOperation(operation: MoveToOtherGroupSaveOperation): Promise<ItemSaveRuleResult> {
    const sourceGroupPermissions = await this.getGroupPermissions(operation.userUuid, operation.groupUuid)
    const targetGroupPermissions = await this.getGroupPermissions(operation.userUuid, operation.targetGroupUuid)

    if (!sourceGroupPermissions || !targetGroupPermissions) {
      return this.buildFailResult(operation, ConflictType.GroupNotMemberError)
    }

    if (operation.existingItem.deleted || operation.incomingItem.deleted) {
      return this.buildFailResult(operation, ConflictType.GroupInvalidState)
    }

    if (sourceGroupPermissions === 'read' || targetGroupPermissions === 'read') {
      return this.buildFailResult(operation, ConflictType.GroupInsufficientPermissionsError)
    }

    if (
      !this.isAuthorizedToSaveContentType(operation.incomingItem.content_type, sourceGroupPermissions) ||
      !this.isAuthorizedToSaveContentType(operation.incomingItem.content_type, targetGroupPermissions)
    ) {
      return this.buildFailResult(operation, ConflictType.GroupInsufficientPermissionsError)
    }

    const usesValidKey = await this.incomingItemUsesValidItemsKey(operation.incomingItem)
    if (!usesValidKey) {
      return this.buildFailResult(operation, ConflictType.GroupInvalidItemsKey, operation.existingItem)
    }

    return this.buildSuccessValue()
  }

  private async handleSaveToGroupOperation(operation: SaveToGroupSaveOperation): Promise<ItemSaveRuleResult> {
    const groupPermissions = await this.getGroupPermissions(operation.userUuid, operation.groupUuid)

    if (!groupPermissions) {
      return this.buildFailResult(operation, ConflictType.GroupNotMemberError)
    }

    if (!this.isAuthorizedToSaveContentType(operation.incomingItem.content_type, groupPermissions)) {
      return this.buildFailResult(operation, ConflictType.GroupInsufficientPermissionsError)
    }

    if (groupPermissions === 'read') {
      return this.buildFailResult(operation, ConflictType.GroupInsufficientPermissionsError)
    }

    const usesValidKey = await this.incomingItemUsesValidItemsKey(operation.incomingItem)
    if (!usesValidKey) {
      return this.buildFailResult(operation, ConflictType.GroupInvalidItemsKey, operation.existingItem)
    }

    return this.buildSuccessValue()
  }

  private async handleCreateToGroupOperation(operation: CreateToGroupSaveOperation): Promise<ItemSaveRuleResult> {
    const groupPermissions = await this.getGroupPermissions(operation.userUuid, operation.groupUuid)

    if (!groupPermissions) {
      return this.buildFailResult(operation, ConflictType.GroupNotMemberError)
    }

    if (!this.isAuthorizedToSaveContentType(operation.incomingItem.content_type, groupPermissions)) {
      return this.buildFailResult(operation, ConflictType.GroupInsufficientPermissionsError)
    }

    if (groupPermissions === 'read') {
      return this.buildFailResult(operation, ConflictType.GroupInsufficientPermissionsError)
    }

    const usesValidKey = await this.incomingItemUsesValidItemsKey(operation.incomingItem)
    if (!usesValidKey) {
      return this.buildFailResult(operation, ConflictType.GroupInvalidItemsKey)
    }

    return this.buildSuccessValue()
  }

  private async incomingItemUsesValidItemsKey(itemHash: ItemHash): Promise<boolean> {
    const isItemNotEncryptedByItemsKey = itemHash.content_type === ContentType.VaultItemsKey
    if (isItemNotEncryptedByItemsKey) {
      return true
    }

    const group = await this.groupService.getGroup({ groupUuid: itemHash.group_uuid as string })

    if (!group) {
      return false
    }

    return itemHash.items_key_id === group.specifiedItemsKeyUuid
  }

  private async getGroupPermissions(userUuid: string, groupUuid: string): Promise<GroupUserPermission | undefined> {
    const groupUser = await this.groupUserService.getUserForGroup({
      userUuid,
      groupUuid: groupUuid,
    })

    if (groupUser) {
      return groupUser.permissions
    }

    return undefined
  }
}
