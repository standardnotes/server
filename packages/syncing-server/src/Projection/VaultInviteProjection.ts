import { VaultInviteType } from '../Domain/VaultInvite/Model/VaultInviteType'

export type VaultInviteProjection = {
  uuid: string
  vault_uuid: string
  user_uuid: string
  inviter_uuid: string
  inviter_public_key: string
  encrypted_vault_data: string
  invite_type: VaultInviteType
  permissions: string
  created_at_timestamp: number
  updated_at_timestamp: number
}
