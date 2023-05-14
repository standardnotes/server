import { TimerInterface } from '@standardnotes/time'
import { ItemShareFactoryInterface } from './ItemShareFactoryInterface'
import { ItemShareHash } from './ItemShareHash'
import { ItemShare } from '../Model/ItemShare'

export class ItemShareFactory implements ItemShareFactoryInterface {
  constructor(private timer: TimerInterface) {}

  create(dto: { userUuid: string; itemShareHash: ItemShareHash }): ItemShare {
    const newItemShare = new ItemShare()
    newItemShare.uuid = dto.itemShareHash.uuid
    newItemShare.userUuid = dto.userUuid
    newItemShare.itemUuid = dto.itemShareHash.item_uuid
    newItemShare.shareToken = dto.itemShareHash.share_token
    newItemShare.encryptedContentKey = dto.itemShareHash.encrypted_content_key
    newItemShare.permissions = dto.itemShareHash.permissions
    newItemShare.fileRemoteIdentifier = dto.itemShareHash.file_remote_identifier ?? null
    newItemShare.contentType = dto.itemShareHash.content_type
    newItemShare.duration = dto.itemShareHash.duration

    const now = this.timer.getTimestampInSeconds()
    newItemShare.updatedAtTimestamp = now
    newItemShare.createdAtTimestamp = now

    if (dto.itemShareHash.created_at_timestamp) {
      newItemShare.createdAtTimestamp = dto.itemShareHash.created_at_timestamp
    }

    return newItemShare
  }

  createStub(dto: { userUuid: string; itemShareHash: ItemShareHash }): ItemShare {
    const item = this.create(dto)
    return item
  }
}
