import { ItemShare } from '../Model/ItemShare'
import { Item } from '../../Item/Item'
import { ShareItemDTO } from './ShareItemDTO'
import { ShareItemResult } from './ShareItemResult'
import { UpdateSharedItemDto } from './UpdateSharedItemDto'

export type ItemSharingGetSharedItemResult =
  | {
      itemShare: ItemShare
      item: Item
    }
  | {
      error: { tag: 'expired-item-share' | 'not-found-item-share' }
    }

export interface ItemShareServiceInterface {
  shareItem(dto: ShareItemDTO): Promise<ShareItemResult | null>
  getSharedItem(shareToken: string): Promise<ItemSharingGetSharedItemResult>
  getUserItemShares(userUuid: string): Promise<ItemShare[]>
  updateSharedItem(dto: UpdateSharedItemDto): Promise<boolean>
  expireSharedItem(shareToken: string): Promise<void>
}
