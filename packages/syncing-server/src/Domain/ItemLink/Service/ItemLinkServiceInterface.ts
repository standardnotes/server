import { ItemLink } from '../Model/ItemLink'
import { Item } from '../../Item/Item'
import { ShareItemDTO } from './LinkItemDTO'
import { ShareItemResult } from './LinkItemResult'

export type ItemLinkGetSharedItemResult =
  | {
      itemLink: ItemLink
      item: Item
    }
  | {
      error: { tag: 'expired-item-share' | 'not-found-item-share' }
    }

export interface ItemLinkServiceInterface {
  shareItem(dto: ShareItemDTO): Promise<ShareItemResult | null>
  getSharedItem(shareToken: string): Promise<ItemLinkGetSharedItemResult>
  getUserItemLinks(userUuid: string): Promise<ItemLink[]>
  expireSharedItem(shareToken: string): Promise<void>
}
