import { Item } from '../../../Item/Item'

export interface GetItemsResult {
  items: Item[]
  cursorToken?: string
}
