import { ContentType } from '@standardnotes/common'

export type ItemShareHash = {
  uuid: string
  item_uuid: string
  share_token: string
  public_key: string
  encrypted_content_key: string
  content_type: ContentType
  file_remote_identifier?: string
  duration: string
  created_at_timestamp?: number
  updated_at_timestamp?: number
}
