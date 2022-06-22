import { injectable } from 'inversify'
import { ItemSaveValidationDTO } from '../SaveValidator/ItemSaveValidationDTO'
import { ItemSaveRuleResult } from './ItemSaveRuleResult'
import { ItemSaveRuleInterface } from './ItemSaveRuleInterface'
import { ConflictType } from '@standardnotes/responses'

@injectable()
export class ContentFilter implements ItemSaveRuleInterface {
  async check(dto: ItemSaveValidationDTO): Promise<ItemSaveRuleResult> {
    if (dto.itemHash.content === undefined || dto.itemHash.content === null) {
      return {
        passed: true,
      }
    }

    const validContent = typeof dto.itemHash.content === 'string'

    if (!validContent) {
      return {
        passed: false,
        conflict: {
          unsavedItem: dto.itemHash,
          type: ConflictType.ContentError,
        },
      }
    }

    return {
      passed: true,
    }
  }
}
