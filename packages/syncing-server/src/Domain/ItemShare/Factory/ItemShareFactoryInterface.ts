import { ItemShare } from './../Model/ItemShare'
import { ItemShareHash } from './ItemShareHash'

export interface ItemShareFactoryInterface {
  create(dto: { userUuid: string; itemShareHash: ItemShareHash }): ItemShare
  createStub(dto: { userUuid: string; itemShareHash: ItemShareHash }): ItemShare
}
