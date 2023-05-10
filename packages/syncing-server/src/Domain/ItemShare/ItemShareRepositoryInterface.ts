import { ItemShare } from './ItemShare'

export type ItemShareQuery = {
  userUuid: string
  shareToken: string
}

export type UserItemSharesQuery = {
  userUuid: string
}

export interface ItemShareRepositoryInterface {
  create(itemShare: ItemShare): Promise<ItemShare>
  remove(itemShare: ItemShare): Promise<ItemShare>
  updateEncryptedContentKey(dto: { shareToken: string; encryptedContentKey: string }): Promise<void>
  deleteByShareToken(shareToken: string): Promise<void>
  findByShareToken(shareToken: string): Promise<ItemShare | null>
  findAll(query: UserItemSharesQuery): Promise<ItemShare[]>
}
