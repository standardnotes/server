import { Uuid } from '@standardnotes/domain-core'

import { Item } from '../Item/Item'
import { ItemHash } from '../Item/ItemHash'

export interface SharedVaultOperationOnItemProps {
  incomingItemHash: ItemHash
  userUuid: Uuid
  type: string
  sharedVaultUuid: Uuid
  targetSharedVaultUuid?: Uuid
  existingItem?: Item
}
