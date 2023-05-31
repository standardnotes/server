import { ItemSaveValidationDTO } from '../SaveValidator/ItemSaveValidationDTO'
import { ItemSaveRuleResult } from './ItemSaveRuleResult'
import { ItemSaveRuleInterface } from './ItemSaveRuleInterface'
import { lt } from 'semver'
import { ConflictType } from '../../../Tmp/ConflictType'

const MINIMUM_SNJS_VERSION_FOR_GROUP_OPERATIONS = '2.200.0'

export class GroupSnjsVersionFilter implements ItemSaveRuleInterface {
  async check(dto: ItemSaveValidationDTO): Promise<ItemSaveRuleResult> {
    const successValue = {
      passed: true,
    }

    const groupUuidInvolved = dto.existingItem?.groupUuid || dto.itemHash.vault_system_identifier
    if (!groupUuidInvolved) {
      return successValue
    }

    const isClientSnjsVersionLessThanMinimum = lt(dto.snjsVersion, MINIMUM_SNJS_VERSION_FOR_GROUP_OPERATIONS)
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
