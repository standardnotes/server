export type ItemProjection = {
  uuid: string
  items_key_id: string | null
  duplicate_of: string | null
  enc_item_key: string | null
  vault_uuid: string | null
  content: string | null
  content_type: string
  auth_hash: string | null
  deleted: boolean
  user_uuid: string | null
  last_edited_by_uuid: string | null
  created_at: string
  created_at_timestamp: number
  updated_at: string
  updated_at_timestamp: number
  updated_with_session: string | null
}
