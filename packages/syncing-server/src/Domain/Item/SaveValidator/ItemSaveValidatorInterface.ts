import { ItemSaveValidationDTO } from './ItemSaveValidationDTO'
import { ItemSaveValidationResult } from './ItemSaveValidationResult'

export interface ItemSaveValidatorInterface {
  validate(dto: ItemSaveValidationDTO): Promise<ItemSaveValidationResult>
}
