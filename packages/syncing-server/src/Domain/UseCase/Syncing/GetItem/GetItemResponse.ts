import { Item } from '../../../Item/Item'

export type GetItemResponse =
  | {
      success: true
      item: Item
    }
  | {
      success: false
      message: string
    }
