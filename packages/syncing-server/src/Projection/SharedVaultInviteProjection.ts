export type SharedVaultInviteProjection = {
  uuid: string
  shared_vault_uuid: string
  user_uuid: string
  inviter_uuid: string
  sender_public_key: string
  encrypted_message: string
  permissions: string
  created_at_timestamp: number
  updated_at_timestamp: number
}
