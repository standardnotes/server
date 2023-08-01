import { Item } from '../Item'
import { ItemHash } from '../ItemHash'

export type ItemSaveValidationDTO = {
  userUuid: string
  apiVersion: string
  itemHash: ItemHash
  snjsVersion: string
  existingItem: Item | null
}
