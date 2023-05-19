import { Contact } from '../Contact/Model/Contact'
import { GroupUser } from '../GroupUser/Model/GroupKey'
import { Item } from '../Item/Item'
import { ItemConflict } from '../Item/ItemConflict'

export type SyncItemsResponse = {
  retrievedItems: Array<Item>
  savedItems: Array<Item>
  conflicts: Array<ItemConflict>
  groupKeys: Array<GroupUser>
  contacts: Array<Contact>
  syncToken: string
  cursorToken?: string
}
