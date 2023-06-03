import { ItemSaveValidationDTO } from '../SaveValidator/ItemSaveValidationDTO'
import { ItemSaveRuleResult } from './ItemSaveRuleResult'
import { ItemSaveRuleInterface } from './ItemSaveRuleInterface'
import { lt } from 'semver'
import { ConflictType } from '../../../Tmp/ConflictType'

const MINIMUM_SNJS_VERSION_FOR_SHARED_VAULT_OPERATIONS = '2.200.0'

export class SharedVaultSnjsVersionFilter implements ItemSaveRuleInterface {
  async check(dto: ItemSaveValidationDTO): Promise<ItemSaveRuleResult> {
    const successValue = {
      passed: true,
    }

    const sharedVaultUuidInvolved = dto.existingItem?.sharedVaultUuid || dto.itemHash.key_system_identifier
    if (!sharedVaultUuidInvolved) {
      return successValue
    }

    const isClientSnjsVersionLessThanMinimum = lt(dto.snjsVersion, MINIMUM_SNJS_VERSION_FOR_SHARED_VAULT_OPERATIONS)
    if (isClientSnjsVersionLessThanMinimum) {
      return {
        passed: false,
        conflict: {
          unsavedItem: dto.itemHash,
          serverItem: dto.existingItem ?? undefined,
          type: ConflictType.SnjsVersionError,
        },
      }
    }

    return successValue
  }
}
