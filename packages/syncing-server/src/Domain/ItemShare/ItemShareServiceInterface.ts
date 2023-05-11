import { ContentType } from '@standardnotes/common'
import { ItemShare } from './ItemShare'
import { Item } from '../Item/Item'

export type ShareItemDTO = {
  itemUuid: string
  userUuid: string
  publicKey: string
  encryptedContentKey: string
  contentType: ContentType
  fileRemoteIdentifier?: string
}

export type UpdateSharedItemDto = {
  shareToken: string
  encryptedContentKey: string
}

export type ShareItemResult = {
  itemShare: ItemShare
}

export interface ItemShareServiceInterface {
  shareItem(dto: ShareItemDTO): Promise<ShareItemResult>
  getSharedItem(shareToken: string): Promise<{ itemShare: ItemShare; item: Item } | null>
  getUserItemShares(userUuid: string): Promise<ItemShare[]>
  updateSharedItem(dto: UpdateSharedItemDto): Promise<boolean>
}
