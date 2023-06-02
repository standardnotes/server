import { ItemSaveValidationDTO } from '../SaveValidator/ItemSaveValidationDTO'
import { ItemSaveRuleResult } from './ItemSaveRuleResult'
import { ItemSaveRuleInterface } from './ItemSaveRuleInterface'
import { GroupUserServiceInterface } from '../../GroupUser/Service/GroupUserServiceInterface'
import { ItemHash } from '../ItemHash'
import { GroupUserPermission } from '../../GroupUser/Model/GroupUserPermission'
import { GroupServiceInterface } from '../../Group/Service/GroupServiceInterface'
import { ContentType } from '@standardnotes/common'
import { ConflictType } from '../../../Tmp/ConflictType'

export class GroupFilter implements ItemSaveRuleInterface {
  constructor(private groupService: GroupServiceInterface, private groupUserService: GroupUserServiceInterface) {}

  async check(dto: ItemSaveValidationDTO): Promise<ItemSaveRuleResult> {
    if (!dto.existingItem?.groupUuid) {
      return {
        passed: true,
      }
    }

    const groupUser = await this.groupUserService.getUserForGroup({
      userUuid: dto.userUuid,
      groupUuid: dto.existingItem.groupUuid,
    })

    if (!groupUser) {
      return {
        passed: false,
        conflict: {
          unsavedItem: dto.itemHash,
          type: ConflictType.GroupNotMemberError,
        },
      }
    }

    if (groupUser.permissions === 'read') {
      return {
        passed: false,
        conflict: {
          unsavedItem: dto.itemHash,
          serverItem: dto.existingItem,
          type: ConflictType.GroupInsufficientPermissionsError,
        },
      }
    }

    if (!this.isAuthorizedToSaveContentType(dto.itemHash.content_type, groupUser.permissions)) {
      return {
        passed: false,
        conflict: {
          unsavedItem: dto.itemHash,
          serverItem: dto.existingItem,
          type: ConflictType.GroupInsufficientPermissionsError,
        },
      }
    }

    const usesValidKey = await this.incomingItemUsesValidItemsKey(dto.itemHash, dto.existingItem.groupUuid)
    if (!usesValidKey) {
      return {
        passed: false,
        conflict: {
          unsavedItem: dto.itemHash,
          serverItem: dto.existingItem,
          type: ConflictType.GroupInvalidItemsKey,
        },
      }
    }

    return {
      passed: true,
    }
  }

  private isAuthorizedToSaveContentType(contentType: ContentType, permissions: GroupUserPermission): boolean {
    if (contentType === ContentType.VaultItemsKey) {
      return permissions === 'admin'
    }

    return true
  }

  private async incomingItemUsesValidItemsKey(itemHash: ItemHash, groupUuid: string): Promise<boolean> {
    if (itemHash.deleted) {
      return true
    }

    const isItemNotEncryptedByItemsKey = itemHash.content_type === ContentType.VaultItemsKey
    if (isItemNotEncryptedByItemsKey) {
      return true
    }

    const group = await this.groupService.getGroup({ groupUuid: groupUuid })
    if (!group) {
      return false
    }

    return itemHash.items_key_id === group.specifiedItemsKeyUuid
  }
}
