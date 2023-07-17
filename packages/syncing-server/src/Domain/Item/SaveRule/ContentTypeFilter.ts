import { ConflictType } from '@standardnotes/responses'
import { ContentType } from '@standardnotes/domain-core'

import { ItemSaveValidationDTO } from '../SaveValidator/ItemSaveValidationDTO'
import { ItemSaveRuleResult } from './ItemSaveRuleResult'
import { ItemSaveRuleInterface } from './ItemSaveRuleInterface'

export class ContentTypeFilter implements ItemSaveRuleInterface {
  async check(dto: ItemSaveValidationDTO): Promise<ItemSaveRuleResult> {
    const contentTypeOrError = ContentType.create(dto.itemHash.props.content_type)
    if (contentTypeOrError.isFailed()) {
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
