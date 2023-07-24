import { Item } from '../Item/Item'
import { ItemHash } from '../Item/ItemHash'

export interface SharedVaultOperationOnItemProps {
  incomingItemHash: ItemHash
  userUuid: string
  type: string
  sharedVaultUuid: string
  targetSharedVaultUuid?: string
  existingItem?: Item
}
