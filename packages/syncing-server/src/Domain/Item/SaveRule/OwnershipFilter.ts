import { ItemSaveValidationDTO } from '../SaveValidator/ItemSaveValidationDTO'
import { ItemSaveRuleResult } from './ItemSaveRuleResult'
import { ItemSaveRuleInterface } from './ItemSaveRuleInterface'
import { ConflictType } from '@standardnotes/responses'
import { GetUserGroupsUseCase } from '../../UseCase/Groups/GetUserGroupsUseCase'
import { GetGroupItemsUseCase } from '../../UseCase/Groups/GetGroupItemsUseCase'

export class OwnershipFilter implements ItemSaveRuleInterface {
  constructor(private getUserGroupsUseCase: GetUserGroupsUseCase, private getGroupItemsUseCase: GetGroupItemsUseCase) {}

  async check(dto: ItemSaveValidationDTO): Promise<ItemSaveRuleResult> {
    const itemBelongsToADifferentUser = dto.existingItem !== null && dto.existingItem.userUuid !== dto.userUuid
    if (itemBelongsToADifferentUser) {
      const itemBelongsToSharedGroup = await this.itemBelongsToSharedGroup(dto.userUuid, dto.itemHash.uuid)
      if (itemBelongsToSharedGroup) {
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

  private async itemBelongsToSharedGroup(userUuid: string, itemUuid: string): Promise<boolean> {
    const userGroups = await this.getUserGroupsUseCase.execute({ userUuid: userUuid })
    if (userGroups.success) {
      for (const group of userGroups.groups) {
        const groupItems = await this.getGroupItemsUseCase.execute({ groupUuid: group.uuid })
        if (groupItems.success) {
          const groupItemExists = groupItems.groupItems.find((groupItem) => groupItem.itemUuid === itemUuid)
          if (groupItemExists) {
            return true
          }
        }
      }
    }

    return false
  }
}
