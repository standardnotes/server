import { ItemSaveValidationDTO } from '../SaveValidator/ItemSaveValidationDTO'
import { ItemSaveRuleResult } from './ItemSaveRuleResult'
import { ItemSaveRuleInterface } from './ItemSaveRuleInterface'
import { ConflictType } from '@standardnotes/responses'
import { GroupUserServiceInterface } from '../../GroupUser/Service/GroupUserServiceInterface'
import { ItemHash } from '../ItemHash'
import { GroupUserPermission } from '../../GroupUser/Model/GroupUserPermission'

export class OwnershipFilter implements ItemSaveRuleInterface {
  constructor(private groupUserService: GroupUserServiceInterface) {}

  async check(dto: ItemSaveValidationDTO): Promise<ItemSaveRuleResult> {
    const isItemBeingSetForGroup = dto.itemHash.group_uuid != null
    const isItemBeingRemovedFromGroup =
      dto.existingItem != null && dto.existingItem.groupUuid != null && dto.itemHash.group_uuid == null
    const itemBelongsToADifferentUser = dto.existingItem != null && dto.existingItem.userUuid !== dto.userUuid

    if (itemBelongsToADifferentUser || isItemBeingSetForGroup || isItemBeingRemovedFromGroup) {
      const groupAuthorization = await this.itemBelongsToAuthorizedSharedGroup(dto.userUuid, dto.itemHash)
      if (groupAuthorization) {
        if (isItemBeingRemovedFromGroup) {
          if (groupAuthorization === GroupUserPermission.Admin) {
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
  ): Promise<GroupUserPermission | undefined> {
    const groupUsers = await this.groupUserService.getGroupUsersForUser({ userUuid })

    for (const groupUser of groupUsers) {
      if (itemHash.group_uuid === groupUser.groupUuid) {
        return groupUser.permissions as GroupUserPermission
      }
    }

    return undefined
  }
}
