import { Item } from '../Item'
import { ItemConflict } from '../ItemConflict'

export type ItemSaveRuleResult = {
  passed: boolean
  conflict?: ItemConflict
  skipped?: Item
}
