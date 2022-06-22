import { Item } from './Item'

export type GetItemsResult = {
  items: Array<Item>
  cursorToken?: string
}
