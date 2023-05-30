import { ContentType } from '@standardnotes/common'

import { ItemSaveValidationDTO } from '../SaveValidator/ItemSaveValidationDTO'
import { ItemSaveRuleResult } from './ItemSaveRuleResult'
import { ItemSaveRuleInterface } from './ItemSaveRuleInterface'
import { ConflictType } from '../../../Tmp/ConflictType'

export class ContentTypeFilter implements ItemSaveRuleInterface {
  async check(dto: ItemSaveValidationDTO): Promise<ItemSaveRuleResult> {
    const validContentType = Object.values(ContentType).includes(dto.itemHash.content_type as ContentType)

    if (!validContentType) {
      return {
        passed: false,
        conflict: {
          unsavedItem: dto.itemHash,
          type: ConflictType.ContentTypeError,
        },
      }
    }

    return {
      passed: true,
    }
  }
}
