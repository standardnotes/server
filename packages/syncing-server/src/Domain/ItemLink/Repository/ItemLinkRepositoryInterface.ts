import { ItemLink } from '../Model/ItemLink'

export type ItemLinkQuery = {
  userUuid: string
  shareToken: string
}

export type UserItemLinksQuery = {
  userUuid: string
}

export interface ItemLinksRepositoryInterface {
  create(itemShare: ItemLink): Promise<ItemLink>
  remove(itemShare: ItemLink): Promise<ItemLink>
  expire(shareToken: string): Promise<void>
  updateEncryptedContentKey(dto: { shareToken: string; encryptedContentKey: string }): Promise<void>
  deleteByShareToken(shareToken: string): Promise<void>
  findByShareToken(shareToken: string): Promise<ItemLink | null>
  findAll(query: UserItemLinksQuery): Promise<ItemLink[]>
}
