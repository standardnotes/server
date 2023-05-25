import { Item } from '../Item'
import { ItemHash } from '../ItemHash'

export type ItemSaveValidationDTO = {
  userUuid: string
  apiVersion: string
  snjsVersion: string
  itemHash: ItemHash
  existingItem: Item | null
}
