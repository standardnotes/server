import { ItemConflictHttpRepresentation } from '../../../Mapping/Http/ItemConflictHttpRepresentation'
import { ItemHttpRepresentation } from '../../../Mapping/Http/ItemHttpRepresentation'
import { MessageHttpRepresentation } from '../../../Mapping/Http/MessageHttpRepresentation'
import { NotificationHttpRepresentation } from '../../../Mapping/Http/NotificationHttpRepresentation'
import { SavedItemHttpRepresentation } from '../../../Mapping/Http/SavedItemHttpRepresentation'
import { SharedVaultHttpRepresentation } from '../../../Mapping/Http/SharedVaultHttpRepresentation'
import { SharedVaultInviteHttpRepresentation } from '../../../Mapping/Http/SharedVaultInviteHttpRepresentation'

export type SyncResponse20200115 = {
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
