import { TimerInterface } from '@standardnotes/time'
import { ItemLinkFactoryInterface } from './ItemLinkFactoryInterface'
import { ItemLinkHash } from './ItemLinkHash'
import { ItemLink } from '../Model/ItemLink'

export class ItemLinkFactory implements ItemLinkFactoryInterface {
  constructor(private timer: TimerInterface) {}

  create(dto: { userUuid: string; itemShareHash: ItemLinkHash }): ItemLink {
    const newItemLink = new ItemLink()
    newItemLink.uuid = dto.itemShareHash.uuid
    newItemLink.userUuid = dto.userUuid
    newItemLink.itemUuid = dto.itemShareHash.item_uuid
    newItemLink.shareToken = dto.itemShareHash.share_token
    newItemLink.encryptedContentKey = dto.itemShareHash.encrypted_content_key
    newItemLink.fileRemoteIdentifier = dto.itemShareHash.file_remote_identifier ?? null
    newItemLink.contentType = dto.itemShareHash.content_type
    newItemLink.duration = dto.itemShareHash.duration

    const now = this.timer.getTimestampInSeconds()
    newItemLink.updatedAtTimestamp = now
    newItemLink.createdAtTimestamp = now

    if (dto.itemShareHash.created_at_timestamp) {
      newItemLink.createdAtTimestamp = dto.itemShareHash.created_at_timestamp
    }

    return newItemLink
  }

  createStub(dto: { userUuid: string; itemShareHash: ItemLinkHash }): ItemLink {
    const item = this.create(dto)
    return item
  }
}
