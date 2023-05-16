import { GroupUserKey } from './../GroupUserKey/Model/GroupUserKey'
import { Item } from '../Item/Item'
import { ItemConflict } from '../Item/ItemConflict'

export type SyncItemsResponse = {
  retrievedItems: Array<Item>
  savedItems: Array<Item>
  conflicts: Array<ItemConflict>
  groupKeys: Array<GroupUserKey>
  syncToken: string
  cursorToken?: string
}
