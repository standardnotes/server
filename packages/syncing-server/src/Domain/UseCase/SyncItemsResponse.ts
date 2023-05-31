import { GroupInvite } from '../GroupInvite/Model/GroupInvite'
import { Contact } from '../Contact/Model/Contact'
import { Item } from '../Item/Item'
import { ItemConflict } from '../Item/ItemConflict'
import { Group } from '../Group/Model/Group'

export type SyncItemsResponse = {
  retrievedItems: Array<Item>
  savedItems: Array<Item>
  conflicts: Array<ItemConflict>
  groups: Array<Group>
  groupInvites: Array<GroupInvite>
  contacts: Array<Contact>
  syncToken: string
  cursorToken?: string
}
