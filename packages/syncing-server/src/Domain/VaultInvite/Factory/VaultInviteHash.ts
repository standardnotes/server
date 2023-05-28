import { VaultUserPermission } from '../../VaultUser/Model/VaultUserPermission'
import { VaultInviteType } from '../Model/VaultInviteType'

export type VaultInviteHash = {
  uuid: string
  user_uuid: string
  vault_uuid: string
  inviter_uuid: string
  inviter_public_key: string
  encrypted_vault_data: string
  invite_type: VaultInviteType
  permissions: VaultUserPermission
  created_at_timestamp?: number
  updated_at_timestamp?: number
}
