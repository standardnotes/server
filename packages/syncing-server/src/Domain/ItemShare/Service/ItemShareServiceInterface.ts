import { ItemShare } from '../Model/ItemShare'
import { Item } from '../../Item/Item'
import { ShareItemDTO } from './ShareItemDTO'
import { ShareItemResult } from './ShareItemResult'
import { UpdateSharedItemDto } from './UpdateSharedItemDto'

export interface ItemShareServiceInterface {
  shareItem(dto: ShareItemDTO): Promise<ShareItemResult | null>
  getSharedItem(shareToken: string): Promise<{ itemShare: ItemShare; item: Item } | null>
  getUserItemShares(userUuid: string): Promise<ItemShare[]>
  updateSharedItem(dto: UpdateSharedItemDto): Promise<boolean>
  expireSharedItem(shareToken: string): Promise<void>
}
