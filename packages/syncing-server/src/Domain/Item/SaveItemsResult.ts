import { Item } from './Item'
import { ItemConflict } from './ItemConflict'

export type SaveItemsResult = {
  savedItems: Array<Item>
  conflicts: Array<ItemConflict>
  syncToken: string
}
