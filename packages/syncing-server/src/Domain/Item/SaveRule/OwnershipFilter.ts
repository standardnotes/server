import { ItemSaveValidationDTO } from '../SaveValidator/ItemSaveValidationDTO'
import { ItemSaveRuleResult } from './ItemSaveRuleResult'
import { ItemSaveRuleInterface } from './ItemSaveRuleInterface'
import { ConflictType } from '../../../Tmp/ConflictType'

export class OwnershipFilter implements ItemSaveRuleInterface {
  async check(dto: ItemSaveValidationDTO): Promise<ItemSaveRuleResult> {
    const deferToSharedVaultFilter = dto.existingItem?.sharedVaultUuid
    if (deferToSharedVaultFilter) {
      return {
        passed: true,
      }
    }

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
