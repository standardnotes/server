import { Item } from '../../../Item/Item'
import { ItemHash } from '../../../Item/ItemHash'

export interface UpdateExistingItemDTO {
  existingItem: Item
  itemHash: ItemHash
  sessionUuid: string | null
  performingUserUuid: string
  isFreeUser: boolean
}
