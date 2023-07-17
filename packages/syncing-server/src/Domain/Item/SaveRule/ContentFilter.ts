import { ItemSaveValidationDTO } from '../SaveValidator/ItemSaveValidationDTO'
import { ItemSaveRuleResult } from './ItemSaveRuleResult'
import { ItemSaveRuleInterface } from './ItemSaveRuleInterface'
import { ConflictType } from '@standardnotes/responses'

export class ContentFilter implements ItemSaveRuleInterface {
  async check(dto: ItemSaveValidationDTO): Promise<ItemSaveRuleResult> {
    if (dto.itemHash.props.content === undefined || dto.itemHash.props.content === null) {
      return {
        passed: true,
      }
    }

    const validContent = typeof dto.itemHash.props.content === 'string'

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
