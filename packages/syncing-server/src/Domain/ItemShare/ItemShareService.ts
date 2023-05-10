import { Item } from '../Item/Item'
import { GetItem } from '../UseCase/GetItem/GetItem'
import { ItemShare } from './ItemShare'
import { ItemShareFactoryInterface } from './ItemShareFactoryInterface'
import { ItemShareRepositoryInterface } from './ItemShareRepositoryInterface'
import {
  ItemShareServiceInterface,
  ShareItemDTO,
  ShareItemResult,
  UpdateSharedItemDto,
} from './ItemShareServiceInterface'
import { v4 as uuidv4 } from 'uuid'

export class ItemShareService implements ItemShareServiceInterface {
  constructor(
    private itemShareRepository: ItemShareRepositoryInterface,
    private itemShareFactory: ItemShareFactoryInterface,
    private getItem: GetItem,
  ) {}

  async getSharedItem(shareToken: string): Promise<{ itemShare: ItemShare; item: Item } | null> {
    const itemShareItem = await this.itemShareRepository.findByShareToken(shareToken)
    if (!itemShareItem) {
      return null
    }

    const itemResponse = await this.getItem.execute({
      userUuid: itemShareItem.userUuid,
      itemUuid: itemShareItem.itemUuid,
    })

    if (!itemResponse || !itemResponse.success) {
      return null
    }

    return { itemShare: itemShareItem, item: { ...itemResponse.item, encItemKey: null, itemsKeyId: null } }
  }

  async shareItem(dto: ShareItemDTO): Promise<ShareItemResult> {
    const uuid = uuidv4()
    const shareToken = uuidv4()

    const newItemShare = this.itemShareFactory.create({
      userUuid: dto.userUuid,
      itemShareHash: {
        uuid,
        item_uuid: dto.itemUuid,
        share_token: shareToken,
        public_key: dto.publicKey,
        encrypted_content_key: dto.encryptedContentKey,
        content_type: dto.contentType,
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
}
