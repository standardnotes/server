import { Item } from '../../../Item/Item'
import { ItemConflict } from '../../../Item/ItemConflict'
import { Message } from '../../../Message/Message'
import { Notification } from '../../../Notifications/Notification'
import { SharedVault } from '../../../SharedVault/SharedVault'
import { SharedVaultInvite } from '../../../SharedVault/User/Invite/SharedVaultInvite'

export type SyncItemsResponse = {
  retrievedItems: Array<Item>
  savedItems: Array<Item>
  conflicts: Array<ItemConflict>
  syncToken: string
  sharedVaults: SharedVault[]
  sharedVaultInvites: SharedVaultInvite[]
  messages: Message[]
  notifications: Notification[]
  cursorToken?: string
}
