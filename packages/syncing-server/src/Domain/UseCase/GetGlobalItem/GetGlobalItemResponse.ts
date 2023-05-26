import { Item } from '../../Item/Item'

export type GetGlobalItemResponse =
  | {
      success: true
      item: Item
    }
  | {
      success: false
      message: string
    }
