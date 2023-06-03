import { ContactProjection } from '../../../Projection/ContactProjection'
import { SharedVaultInviteProjection } from '../../../Projection/SharedVaultInviteProjection'
import { SharedVaultProjection } from '../../../Projection/SharedVaultProjection'
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
  shared_vaults: Array<SharedVaultProjection>
  shared_vault_invites: Array<SharedVaultInviteProjection>
}
