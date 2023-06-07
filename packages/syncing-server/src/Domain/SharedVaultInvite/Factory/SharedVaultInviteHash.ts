import { SharedVaultUserPermission } from '../../SharedVaultUser/Model/SharedVaultUserPermission'

export type SharedVaultInviteHash = {
  uuid: string
  user_uuid: string
  shared_vault_uuid: string
  inviter_uuid: string
  sender_public_key: string
  encrypted_message: string
  permissions: SharedVaultUserPermission
  created_at_timestamp?: number
  updated_at_timestamp?: number
}
