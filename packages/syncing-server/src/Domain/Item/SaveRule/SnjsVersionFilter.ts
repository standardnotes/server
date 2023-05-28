import { ItemSaveValidationDTO } from '../SaveValidator/ItemSaveValidationDTO'
import { ItemSaveRuleResult } from './ItemSaveRuleResult'
import { ItemSaveRuleInterface } from './ItemSaveRuleInterface'
import { ConflictType } from '@standardnotes/responses'
import { lt } from 'semver'

const MINIMUM_SNJS_VERSION_FOR_VAULT_OPERATIONS = '2.200.0'

export class SnjsVersionFilter implements ItemSaveRuleInterface {
  async check(dto: ItemSaveValidationDTO): Promise<ItemSaveRuleResult> {
    const successValue = {
      passed: true,
    }

    const vaultUuidInvolved = dto.existingItem?.vaultUuid || dto.itemHash.vault_uuid
    if (!vaultUuidInvolved) {
      return successValue
    }

    const isClientSnjsVersionLessThanMinimum = lt(dto.snjsVersion, MINIMUM_SNJS_VERSION_FOR_VAULT_OPERATIONS)

    if (isClientSnjsVersionLessThanMinimum) {
      return {
        passed: false,
        conflict: {
          unsavedItem: dto.itemHash,
          type: ConflictType.ContentError,
        },
      }
    }

    return successValue
  }
}
