import { ItemHash } from '../../../Item/ItemHash'
import { Item } from '../../../Item/Item'

export interface DetermineSharedVaultOperationOnItemDTO {
  userUuid: string
  itemHash: ItemHash
  existingItem: Item | null
}
