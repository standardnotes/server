import { ItemSaveValidationDTO } from '../SaveValidator/ItemSaveValidationDTO'
import { ItemSaveRuleResult } from './ItemSaveRuleResult'
import { ItemSaveRuleInterface } from './ItemSaveRuleInterface'
import { ConflictType } from '@standardnotes/responses'
import { GroupUserKeyServiceInterface } from '../../GroupUserKey/Service/GroupUserKeyServiceInterface'
import { ItemHash } from '../ItemHash'
import { GroupPermission } from '../../GroupUserKey/Model/GroupPermission'

export class OwnershipFilter implements ItemSaveRuleInterface {
  constructor(private groupUserKeyService: GroupUserKeyServiceInterface) {}

  async check(dto: ItemSaveValidationDTO): Promise<ItemSaveRuleResult> {
    const isItemBeingSetForGroup = dto.itemHash.group_uuid != null
    const isItemBeingRemovedFromGroup =
      dto.existingItem != null && dto.existingItem.groupUuid != null && dto.itemHash.group_uuid == null
    const itemBelongsToADifferentUser = dto.existingItem != null && dto.existingItem.userUuid !== dto.userUuid

    if (itemBelongsToADifferentUser || isItemBeingSetForGroup || isItemBeingRemovedFromGroup) {
      const groupAuthorization = await this.itemBelongsToAuthorizedSharedGroup(dto.userUuid, dto.itemHash)
      if (groupAuthorization) {
        if (isItemBeingRemovedFromGroup) {
          if (groupAuthorization === GroupPermission.Admin) {
            return {
              passed: true,
            }
          }
        } else {
          return {
            passed: true,
          }
        }
      }

      return {
        passed: false,
        conflict: {
          unsavedItem: dto.itemHash,
          type: ConflictType.UuidConflict,
        },
      }
    }

    return {
      passed: true,
    }
  }

  private async itemBelongsToAuthorizedSharedGroup(
    userUuid: string,
    itemHash: ItemHash,
  ): Promise<GroupPermission | undefined> {
    const userKeys = await this.groupUserKeyService.getGroupUserKeysForUser({ userUuid })

    for (const userKey of userKeys) {
      if (itemHash.group_uuid === userKey.groupUuid) {
        return userKey.permissions as GroupPermission
      }
    }

    return undefined
  }
}
