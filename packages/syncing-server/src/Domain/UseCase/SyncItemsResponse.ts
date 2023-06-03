import { SharedVaultInvite } from '../SharedVaultInvite/Model/SharedVaultInvite'
import { Contact } from '../Contact/Model/Contact'
import { Item } from '../Item/Item'
import { ItemConflict } from '../Item/ItemConflict'
import { SharedVault } from '../SharedVault/Model/SharedVault'

export type SyncItemsResponse = {
  retrievedItems: Array<Item>
  savedItems: Array<Item>
  conflicts: Array<ItemConflict>
  sharedVaults: Array<SharedVault>
  sharedVaultInvites: Array<SharedVaultInvite>
  contacts: Array<Contact>
  syncToken: string
  cursorToken?: string
}
