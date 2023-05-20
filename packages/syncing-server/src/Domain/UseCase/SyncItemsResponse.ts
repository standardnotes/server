import { GroupInvite } from './../GroupInvite/Model/GroupInvite'
import { Contact } from '../Contact/Model/Contact'
import { Item } from '../Item/Item'
import { ItemConflict } from '../Item/ItemConflict'

export type SyncItemsResponse = {
  retrievedItems: Array<Item>
  savedItems: Array<Item>
  conflicts: Array<ItemConflict>
  groupInvites: Array<GroupInvite>
  contacts: Array<Contact>
  syncToken: string
  cursorToken?: string
}
