import { lt } from 'semver'
import { ConflictType } from '@standardnotes/responses'

import { ItemSaveValidationDTO } from '../SaveValidator/ItemSaveValidationDTO'
import { ItemSaveRuleResult } from './ItemSaveRuleResult'
import { ItemSaveRuleInterface } from './ItemSaveRuleInterface'

export class SharedVaultSnjsFilter implements ItemSaveRuleInterface {
  private readonly MINIMUM_SNJS_VERSION_FOR_SHARED_VAULT_OPERATIONS = '2.200.0'

  async check(dto: ItemSaveValidationDTO): Promise<ItemSaveRuleResult> {
    const isItemInASharedVaultOrHasKeySystem =
      dto.existingItem?.isAssociatedWithASharedVault() || dto.itemHash.hasDedicatedKeySystemAssociation()
    if (!isItemInASharedVaultOrHasKeySystem) {
      return {
        passed: true,
      }
    }

    const isClientSnjsVersionLessThanMinimum = lt(
      dto.snjsVersion,
      this.MINIMUM_SNJS_VERSION_FOR_SHARED_VAULT_OPERATIONS,
    )
    if (isClientSnjsVersionLessThanMinimum) {
      return {
        passed: false,
        conflict: {
          unsavedItem: dto.itemHash,
          serverItem: dto.existingItem ?? undefined,
          type: ConflictType.SharedVaultSnjsVersionError,
        },
      }
    }

    return {
      passed: true,
    }
  }
}
