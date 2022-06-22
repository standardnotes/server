import { ConflictType } from '@standardnotes/responses'
import { Item } from './Item'
import { ItemHash } from './ItemHash'

export type ItemConflict = {
  serverItem?: Item
  unsavedItem?: ItemHash
  type: ConflictType
}
