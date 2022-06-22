import { Item } from '../Item'
import { ItemConflict } from '../ItemConflict'

export type ItemSaveValidationResult = {
  passed: boolean
  conflict?: ItemConflict
  skipped?: Item
}
