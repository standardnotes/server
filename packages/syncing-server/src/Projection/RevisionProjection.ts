import { ContentType, RoleName } from '@standardnotes/common'

export type RevisionProjection = {
  uuid: string
  item_uuid: string
  content: string | null
  content_type: ContentType | null
  items_key_id: string | null
  enc_item_key: string | null
  auth_hash: string | null
  creation_date: string
  required_role: RoleName
  created_at: string
  updated_at: string
}
