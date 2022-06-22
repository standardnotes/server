import { injectable } from 'inversify'
import { ItemSaveRuleInterface } from '../SaveRule/ItemSaveRuleInterface'
import { ItemSaveValidationDTO } from './ItemSaveValidationDTO'
import { ItemSaveValidationResult } from './ItemSaveValidationResult'
import { ItemSaveValidatorInterface } from './ItemSaveValidatorInterface'

@injectable()
export class ItemSaveValidator implements ItemSaveValidatorInterface {
  constructor(private rules: Array<ItemSaveRuleInterface>) {}

  async validate(dto: ItemSaveValidationDTO): Promise<ItemSaveValidationResult> {
    for (const rule of this.rules) {
      const result = await rule.check(dto)
      if (!result.passed) {
        return {
          passed: false,
          conflict: result.conflict,
          skipped: result.skipped,
        }
      }
    }

    return {
      passed: true,
    }
  }
}
