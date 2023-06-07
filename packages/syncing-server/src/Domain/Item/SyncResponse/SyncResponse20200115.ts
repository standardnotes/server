import { AsymmetricMessageProjection } from './../../../Projection/AsymmetricMessageProjection'
import { SharedVaultInviteProjection } from '../../../Projection/SharedVaultInviteProjection'
import { SharedVaultProjection } from '../../../Projection/SharedVaultProjection'
import { ItemConflictProjection } from '../../../Projection/ItemConflictProjection'
import { ItemProjection } from '../../../Projection/ItemProjection'
import { SavedItemProjection } from '../../../Projection/SavedItemProjection'
import { UserEventProjection } from '../../../Projection/UserEventProjection'

export type SyncResponse20200115 = {
  retrieved_items: Array<ItemProjection>
  saved_items: Array<SavedItemProjection>
  conflicts: Array<ItemConflictProjection>
  sync_token: string
  cursor_token?: string
  asymmetric_messages: Array<AsymmetricMessageProjection>
  shared_vaults: Array<SharedVaultProjection>
  shared_vault_invites: Array<SharedVaultInviteProjection>
  user_events: Array<UserEventProjection>
}
