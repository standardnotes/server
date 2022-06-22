import { Item } from '../Item'
import { ItemHash } from '../ItemHash'

export type ItemSaveValidationDTO = {
  userUuid: string
  apiVersion: string
  itemHash: ItemHash
  existingItem: Item | null
}
