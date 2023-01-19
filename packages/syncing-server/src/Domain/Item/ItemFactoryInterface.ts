import { Item } from './Item'
import { ItemHash } from './ItemHash'

export interface ItemFactoryInterface {
  create(dto: { userUuid: string; itemHash: ItemHash; sessionUuid: string | null }): Item
  createStub(dto: { userUuid: string; itemHash: ItemHash; sessionUuid: string | null }): Item
}
