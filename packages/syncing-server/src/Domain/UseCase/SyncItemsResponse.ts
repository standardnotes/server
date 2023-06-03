import { SharedVaultInvite } from '../SharedVaultInvite/Model/SharedVaultInvite'
import { Contact } from '../Contact/Model/Contact'
import { Item } from '../Item/Item'
import { ItemConflict } from '../Item/ItemConflict'
import { SharedVault } from '../SharedVault/Model/SharedVault'
import { UserEvent } from '../UserEvent/Model/UserEvent'

export type SyncItemsResponse = {
  retrievedItems: Array<Item>
  savedItems: Array<Item>
  conflicts: Array<ItemConflict>
  sharedVaults: Array<SharedVault>
  sharedVaultInvites: Array<SharedVaultInvite>
  userEvents: Array<UserEvent>
  contacts: Array<Contact>
  syncToken: string
  cursorToken?: string
}
