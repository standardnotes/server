import { ConflictType } from '../../Tmp/ConflictType'
import { Item } from './Item'
import { ItemHash } from './ItemHash'

export type ItemConflict = {
  serverItem?: Item
  unsavedItem?: ItemHash
  type: ConflictType
}
