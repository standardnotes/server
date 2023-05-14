import { GetItem } from '../../UseCase/GetItem/GetItem'
import { ItemLink } from '../Model/ItemLink'

import { ItemLinksRepositoryInterface } from '../Repository/ItemLinkRepositoryInterface'
import { ItemLinkServiceInterface, ItemLinkGetSharedItemResult } from './ItemLinkServiceInterface'

import { v4 as uuidv4 } from 'uuid'
import { ShareItemDTO } from './LinkItemDTO'
import { ShareItemResult } from './LinkItemResult'
import { ItemLinkFactoryInterface } from '../Factory/ItemLinkFactoryInterface'
import { TimerInterface } from '@standardnotes/time'
import { ItemLinkDuration } from '@standardnotes/domain-core'
import { CryptoNode } from '@standardnotes/sncrypto-node'

export class ItemLinkService implements ItemLinkServiceInterface {
  constructor(
    private itemShareRepository: ItemLinksRepositoryInterface,
    private itemShareFactory: ItemLinkFactoryInterface,
    private getItem: GetItem,
    private timer: TimerInterface,
  ) {}

  async getSharedItem(shareToken: string): Promise<ItemLinkGetSharedItemResult> {
    const itemShareItem = await this.itemShareRepository.findByShareToken(shareToken)
    if (!itemShareItem) {
      return { error: { tag: 'not-found-item-share' } }
    }

    if (itemShareItem.consumed) {
      return { error: { tag: 'expired-item-share' } }
    }

    const duration = ItemLinkDuration.create(itemShareItem.duration)
    if (duration.isFailed()) {
      return { error: { tag: 'not-found-item-share' } }
    }

    const durationValue = duration.getValue()

    if (durationValue.isDateDuration) {
      const expired = itemShareItem.createdAtTimestamp + durationValue.asSeconds < this.timer.getTimestampInSeconds()
      if (expired) {
        await this.expireSharedItem(shareToken)
        return { error: { tag: 'expired-item-share' } }
      }
    }

    const itemResponse = await this.getItem.execute({
      userUuid: itemShareItem.userUuid,
      itemUuid: itemShareItem.itemUuid,
    })

    if (!itemResponse || !itemResponse.success) {
      return { error: { tag: 'not-found-item-share' } }
    }

    if (durationValue.value === ItemLinkDuration.DURATIONS.AfterConsume) {
      await this.expireSharedItem(shareToken)
    }

    return { itemLink: itemShareItem, item: { ...itemResponse.item, encItemKey: null, itemsKeyId: null } }
  }

  async shareItem(dto: ShareItemDTO): Promise<ShareItemResult | null> {
    const uuid = uuidv4()
    const crypto = new CryptoNode()
    const shareToken = await crypto.generateRandomKey(192)

    const duration = ItemLinkDuration.create(dto.duration)
    if (duration.isFailed()) {
      return null
    }

    const newItemLink = this.itemShareFactory.create({
      userUuid: dto.userUuid,
      itemShareHash: {
        uuid,
        item_uuid: dto.itemUuid,
        share_token: shareToken,
        permissions: dto.permissions,
        encrypted_content_key: dto.encryptedContentKey,
        content_type: dto.contentType,
        file_remote_identifier: dto.fileRemoteIdentifier,
        duration: dto.duration,
      },
    })

    const savedItem = await this.itemShareRepository.create(newItemLink)

    return { itemShare: savedItem }
  }

  async getUserItemLinks(userUuid: string): Promise<ItemLink[]> {
    return this.itemShareRepository.findAll({ userUuid })
  }

  async expireSharedItem(shareToken: string): Promise<void> {
    return this.itemShareRepository.expire(shareToken)
  }
}
