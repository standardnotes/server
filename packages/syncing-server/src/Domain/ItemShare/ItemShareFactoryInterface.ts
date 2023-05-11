import { ContentType } from '@standardnotes/common'
import { ItemShare } from './ItemShare'

export type ItemShareHash = {
  uuid: string
  item_uuid: string
  share_token: string
  public_key: string
  encrypted_content_key: string
  content_type: ContentType
  file_remote_identifier?: string
  expired?: boolean
  created_at_timestamp?: number
  updated_at_timestamp?: number
}

export interface ItemShareFactoryInterface {
  create(dto: { userUuid: string; itemShareHash: ItemShareHash }): ItemShare
  createStub(dto: { userUuid: string; itemShareHash: ItemShareHash }): ItemShare
}
