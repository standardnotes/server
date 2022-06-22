import { ItemSaveValidationDTO } from '../SaveValidator/ItemSaveValidationDTO'
import { ItemSaveRuleResult } from './ItemSaveRuleResult'

export interface ItemSaveRuleInterface {
  check(dto: ItemSaveValidationDTO): Promise<ItemSaveRuleResult>
}
