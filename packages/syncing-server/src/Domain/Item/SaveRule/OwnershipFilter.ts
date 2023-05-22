import { ItemSaveValidationDTO } from '../SaveValidator/ItemSaveValidationDTO'
import { ItemSaveRuleResult } from './ItemSaveRuleResult'
import { ItemSaveRuleInterface } from './ItemSaveRuleInterface'
import { ConflictType } from '@standardnotes/responses'
import { GroupUserServiceInterface } from '../../GroupUser/Service/GroupUserServiceInterface'
import { ItemHash } from '../ItemHash'
import { GroupUserPermission } from '../../GroupUser/Model/GroupUserPermission'
import { GroupServiceInterface } from '../../Group/Service/GroupServiceInterface'
import { ContentType } from '@standardnotes/common'

export class OwnershipFilter implements ItemSaveRuleInterface {
  constructor(private groupService: GroupServiceInterface, private groupUserService: GroupUserServiceInterface) {}

  async check(dto: ItemSaveValidationDTO): Promise<ItemSaveRuleResult> {
    const isItemBeingSetForGroup = dto.itemHash.group_uuid != null
    const isItemBeingRemovedFromGroup =
      dto.existingItem != null && dto.existingItem.groupUuid != null && dto.itemHash.group_uuid == null
    const itemBelongsToADifferentUser = dto.existingItem != null && dto.existingItem.userUuid !== dto.userUuid

    const successValue = {
      passed: true,
    }

    const failValue = {
      passed: false,
      conflict: {
        unsavedItem: dto.itemHash,
        type: ConflictType.UuidConflict,
      },
    }

    if (itemBelongsToADifferentUser || isItemBeingSetForGroup || isItemBeingRemovedFromGroup) {
      const groupAuthorization = await this.groupAuthorizationForItem(dto.userUuid, dto.itemHash)
      if (!groupAuthorization) {
        return failValue
      }

      if (groupAuthorization === 'read') {
        return failValue
      }

      if (isItemBeingRemovedFromGroup) {
        return groupAuthorization === 'admin' ? successValue : failValue
      }

      if (dto.itemHash.content_type === ContentType.SharedItemsKey && groupAuthorization !== 'admin') {
        return failValue
      }

      const usingValidKey = await this.groupItemIsBeingSavedWithValidItemsKey(dto.itemHash)

      return usingValidKey ? successValue : failValue
    }

    return successValue
  }

  private async groupItemIsBeingSavedWithValidItemsKey(itemHash: ItemHash): Promise<boolean> {
    const isItemNotEncryptedByItemsKey = itemHash.content_type === ContentType.SharedItemsKey
    if (isItemNotEncryptedByItemsKey) {
      return true
    }

    const group = await this.groupService.getGroup({ groupUuid: itemHash.group_uuid as string })

    if (!group) {
      return false
    }

    return itemHash.items_key_id === group.specifiedItemsKeyUuid
  }

  private async groupAuthorizationForItem(
    userUuid: string,
    itemHash: ItemHash,
  ): Promise<GroupUserPermission | undefined> {
    const groupUser = await this.groupUserService.getUserForGroup({
      userUuid,
      groupUuid: itemHash.group_uuid as string,
    })

    if (groupUser) {
      return groupUser.permissions
    }

    return undefined
  }
}
