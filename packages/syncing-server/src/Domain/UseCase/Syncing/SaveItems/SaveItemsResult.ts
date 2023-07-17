import { Item } from '../../../Item/Item'
import { ItemConflict } from '../../../Item/ItemConflict'

export interface SaveItemsResult {
  savedItems: Item[]
  conflicts: ItemConflict[]
  syncToken: string
}
