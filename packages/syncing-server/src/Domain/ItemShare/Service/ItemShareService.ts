import { Item } from '../../Item/Item'
import { GetItem } from '../../UseCase/GetItem/GetItem'
import { ItemShare } from '../Model/ItemShare'

import { ItemShareRepositoryInterface } from '../Repository/ItemShareRepositoryInterface'
import { ItemShareServiceInterface } from './ItemShareServiceInterface'

import { v4 as uuidv4 } from 'uuid'
import { ShareItemDTO } from './ShareItemDTO'
import { ShareItemResult } from './ShareItemResult'
import { ItemShareFactoryInterface } from '../Factory/ItemShareFactoryInterface'
import { UpdateSharedItemDto } from './UpdateSharedItemDto'
import { TimerInterface } from '@standardnotes/time'
import { ItemShareDuration } from '@standardnotes/domain-core'
import { CryptoNode } from '@standardnotes/sncrypto-node'

export class ItemShareService implements ItemShareServiceInterface {
  constructor(
    private itemShareRepository: ItemShareRepositoryInterface,
    private itemShareFactory: ItemShareFactoryInterface,
    private getItem: GetItem,
    private timer: TimerInterface,
  ) {}

  async getSharedItem(shareToken: string): Promise<{ itemShare: ItemShare; item: Item } | null> {
    const itemShareItem = await this.itemShareRepository.findByShareToken(shareToken)
    if (!itemShareItem) {
      return null
    }

    if (itemShareItem.consumed) {
      return null
    }

    const duration = ItemShareDuration.create(itemShareItem.duration)
    if (duration.isFailed()) {
      return null
    }

    const durationValue = duration.getValue()

    if (durationValue.isDateDuration) {
      const expired = itemShareItem.createdAtTimestamp + durationValue.asSeconds < this.timer.getTimestampInSeconds()
      if (expired) {
        await this.expireSharedItem(shareToken)
        return null
      }
    }

    const itemResponse = await this.getItem.execute({
      userUuid: itemShareItem.userUuid,
      itemUuid: itemShareItem.itemUuid,
    })

    if (!itemResponse || !itemResponse.success) {
      return null
    }

    if (durationValue.value === ItemShareDuration.DURATIONS.AfterConsume) {
      await this.expireSharedItem(shareToken)
    }

    return { itemShare: itemShareItem, item: { ...itemResponse.item, encItemKey: null, itemsKeyId: null } }
  }

  async shareItem(dto: ShareItemDTO): Promise<ShareItemResult | null> {
    const uuid = uuidv4()
    const crypto = new CryptoNode()
    const shareToken = await crypto.generateRandomKey(192)

    const duration = ItemShareDuration.create(dto.duration)
    if (duration.isFailed()) {
      return null
    }

    const newItemShare = this.itemShareFactory.create({
      userUuid: dto.userUuid,
      itemShareHash: {
        uuid,
        item_uuid: dto.itemUuid,
        share_token: shareToken,
        public_key: dto.publicKey,
        encrypted_content_key: dto.encryptedContentKey,
        content_type: dto.contentType,
        file_remote_identifier: dto.fileRemoteIdentifier,
        duration: dto.duration,
      },
    })

    const savedItem = await this.itemShareRepository.create(newItemShare)

    return { itemShare: savedItem }
  }

  async updateSharedItem(dto: UpdateSharedItemDto): Promise<boolean> {
    const itemShareItem = await this.itemShareRepository.findByShareToken(dto.shareToken)
    if (!itemShareItem) {
      return false
    }

    await this.itemShareRepository.updateEncryptedContentKey({
      shareToken: itemShareItem.shareToken,
      encryptedContentKey: dto.encryptedContentKey,
    })

    return true
  }

  async getUserItemShares(userUuid: string): Promise<ItemShare[]> {
    return this.itemShareRepository.findAll({ userUuid })
  }

  async expireSharedItem(shareToken: string): Promise<void> {
    return this.itemShareRepository.expire(shareToken)
  }
}
