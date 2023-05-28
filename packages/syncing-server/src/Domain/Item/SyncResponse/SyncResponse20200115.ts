import { ContactProjection } from '../../../Projection/ContactProjection'
import { VaultInviteProjection } from '../../../Projection/VaultInviteProjection'
import { VaultProjection } from '../../../Projection/VaultProjection'
import { ItemConflictProjection } from '../../../Projection/ItemConflictProjection'
import { ItemProjection } from '../../../Projection/ItemProjection'
import { SavedItemProjection } from '../../../Projection/SavedItemProjection'

export type SyncResponse20200115 = {
  retrieved_items: Array<ItemProjection>
  saved_items: Array<SavedItemProjection>
  conflicts: Array<ItemConflictProjection>
  sync_token: string
  cursor_token?: string
  contacts: Array<ContactProjection>
  vaults: Array<VaultProjection>
  vault_invites: Array<VaultInviteProjection>
}
