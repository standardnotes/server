import { ItemSaveValidationDTO } from '../SaveValidator/ItemSaveValidationDTO'
import { ItemSaveRuleResult } from './ItemSaveRuleResult'
import { ItemSaveRuleInterface } from './ItemSaveRuleInterface'
import { ConflictType } from '@standardnotes/responses'
import { GroupUserKeyServiceInterface } from '../../GroupUserKey/Service/GroupUserKeyServiceInterface'
import { ItemHash } from '../ItemHash'

export class OwnershipFilter implements ItemSaveRuleInterface {
  constructor(private groupUserKeyService: GroupUserKeyServiceInterface) {}

  async check(dto: ItemSaveValidationDTO): Promise<ItemSaveRuleResult> {
    const itemBelongsToGroup = dto.itemHash.group_uuid !== null
    const itemBelongsToADifferentUser = dto.existingItem !== null && dto.existingItem.userUuid !== dto.userUuid

    if (itemBelongsToADifferentUser || itemBelongsToGroup) {
      const isAuthorizedForGroup = await this.itemBelongsToAuthorizedSharedGroup(dto.userUuid, dto.itemHash)
      if (isAuthorizedForGroup) {
        return {
          passed: true,
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

  private async itemBelongsToAuthorizedSharedGroup(userUuid: string, itemHash: ItemHash): Promise<boolean> {
    const userKeys = await this.groupUserKeyService.getGroupUserKeysForUser({ userUuid })

    for (const userKey of userKeys) {
      if (itemHash.group_uuid === userKey.groupUuid) {
        return true
      }
    }

    return false
  }
}
