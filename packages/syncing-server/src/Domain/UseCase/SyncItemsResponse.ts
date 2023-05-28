import { VaultInvite } from '../VaultInvite/Model/VaultInvite'
import { Contact } from '../Contact/Model/Contact'
import { Item } from '../Item/Item'
import { ItemConflict } from '../Item/ItemConflict'
import { Vault } from '../Vault/Model/Vault'

export type SyncItemsResponse = {
  retrievedItems: Array<Item>
  savedItems: Array<Item>
  conflicts: Array<ItemConflict>
  vaults: Array<Vault>
  vaultInvites: Array<VaultInvite>
  contacts: Array<Contact>
  syncToken: string
  cursorToken?: string
}
