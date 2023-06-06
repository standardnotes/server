import { ContentType } from '@standardnotes/common'

export type ItemHash = {
  uuid: string
  user_uuid: string
  content?: string
  content_type: ContentType
  deleted?: boolean
  duplicate_of?: string | null
  auth_hash?: string
  enc_item_key?: string
  items_key_id?: string
  key_system_identifier: string | null
  shared_vault_uuid: string | null
  created_at?: string
  created_at_timestamp?: number
  updated_at?: string
  updated_at_timestamp?: number
}
