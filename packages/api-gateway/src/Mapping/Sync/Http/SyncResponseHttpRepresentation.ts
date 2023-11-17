import { ItemConflictHttpRepresentation } from './ItemConflictHttpRepresentation'
import { ItemHttpRepresentation } from './ItemHttpRepresentation'
import { MessageHttpRepresentation } from './MessageHttpRepresentation'
import { NotificationHttpRepresentation } from './NotificationHttpRepresentation'
import { SavedItemHttpRepresentation } from './SavedItemHttpRepresentation'
import { SharedVaultHttpRepresentation } from './SharedVaultHttpRepresentation'
import { SharedVaultInviteHttpRepresentation } from './SharedVaultInviteHttpRepresentation'

export type SyncResponseHttpRepresentation = {
  retrieved_items: ItemHttpRepresentation[]
  saved_items: SavedItemHttpRepresentation[]
  conflicts: ItemConflictHttpRepresentation[]
  sync_token: string
  cursor_token?: string
  messages: MessageHttpRepresentation[]
  shared_vaults: SharedVaultHttpRepresentation[]
  shared_vault_invites: SharedVaultInviteHttpRepresentation[]
  notifications: NotificationHttpRepresentation[]
}
