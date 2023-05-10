import { TimerInterface } from '@standardnotes/time'
import { ItemShareFactoryInterface, ItemShareHash } from './ItemShareFactoryInterface'
import { ItemShare } from './ItemShare'

export class ItemShareFactory implements ItemShareFactoryInterface {
  constructor(private timer: TimerInterface) {}

  create(dto: { userUuid: string; itemShareHash: ItemShareHash }): ItemShare {
    const newItemShare = new ItemShare()
    newItemShare.uuid = dto.itemShareHash.uuid
    newItemShare.shareToken = dto.itemShareHash.share_token
    newItemShare.encryptedContentKey = dto.itemShareHash.encrypted_content_key
    newItemShare.publicKey = dto.itemShareHash.public_key
    if (dto.itemShareHash.expired != null) {
      newItemShare.expired = dto.itemShareHash.expired
    }

    const now = this.timer.getTimestampInMicroseconds()
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
