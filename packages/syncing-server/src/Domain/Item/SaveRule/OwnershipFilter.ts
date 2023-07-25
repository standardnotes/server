import { ItemSaveValidationDTO } from '../SaveValidator/ItemSaveValidationDTO'
import { ItemSaveRuleResult } from './ItemSaveRuleResult'
import { ItemSaveRuleInterface } from './ItemSaveRuleInterface'
import { ConflictType } from '@standardnotes/responses'
import { Uuid } from '@standardnotes/domain-core'

export class OwnershipFilter implements ItemSaveRuleInterface {
  async check(dto: ItemSaveValidationDTO): Promise<ItemSaveRuleResult> {
    const deferToSharedVaultFilter =
      dto.existingItem?.isAssociatedWithASharedVault() || dto.itemHash.representsASharedVaultItem()
    if (deferToSharedVaultFilter) {
      return {
        passed: true,
      }
    }

    const userUuidOrError = Uuid.create(dto.userUuid)
    if (userUuidOrError.isFailed()) {
      return {
        passed: false,
        conflict: {
          unsavedItem: dto.itemHash,
          type: ConflictType.UuidError,
        },
      }
    }
    const userUuid = userUuidOrError.getValue()

    const itemBelongsToADifferentUser = dto.existingItem !== null && !dto.existingItem.props.userUuid.equals(userUuid)
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
