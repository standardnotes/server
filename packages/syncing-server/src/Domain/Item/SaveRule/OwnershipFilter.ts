import { ItemSaveValidationDTO } from '../SaveValidator/ItemSaveValidationDTO'
import { ItemSaveRuleResult } from './ItemSaveRuleResult'
import { ItemSaveRuleInterface } from './ItemSaveRuleInterface'
import { ConflictType } from '@standardnotes/responses'

export class OwnershipFilter implements ItemSaveRuleInterface {
  async check(dto: ItemSaveValidationDTO): Promise<ItemSaveRuleResult> {
    const itemBelongsToADifferentUser = dto.existingItem !== null && dto.existingItem.userUuid !== dto.userUuid
    if (itemBelongsToADifferentUser) {
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
}
