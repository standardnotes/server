export interface ItemBackupRepresentation {
  uuid: string
  items_key_id: string | null
  duplicate_of: string | null
  enc_item_key: string | null
  content: string | null
  content_type: string
  auth_hash: string | null
  deleted: boolean
  created_at: string
  created_at_timestamp: number
  updated_at: string
  updated_at_timestamp: number
  updated_with_session: string | null
  user_uuid: string
  key_system_identifier: string | null
  shared_vault_uuid: string | null
  last_edited_by: string | null
}
