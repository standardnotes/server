export interface SharedVaultInviteHttpRepresentation {
  uuid: string
  shared_vault_uuid: string
  user_uuid: string
  sender_uuid: string
  encrypted_message: string
  permissions: string
  created_at_timestamp: number
  updated_at_timestamp: number
}
