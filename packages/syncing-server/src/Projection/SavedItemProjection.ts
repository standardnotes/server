export type SavedItemProjection = {
  uuid: string
  duplicate_of: string | null
  content_type: string
  auth_hash: string | null
  deleted: boolean
  created_at: string
  created_at_timestamp: number
  updated_at: string
  updated_at_timestamp: number
  shared_vault_uuid: string | null
  key_system_identifier: string | null
  last_edited_by_uuid: string | null
  user_uuid: string
}
