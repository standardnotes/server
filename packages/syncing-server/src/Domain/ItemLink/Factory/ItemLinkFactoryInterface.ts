import { ItemLink } from '../Model/ItemLink'
import { ItemLinkHash } from './ItemLinkHash'

export interface ItemLinkFactoryInterface {
  create(dto: { userUuid: string; itemShareHash: ItemLinkHash }): ItemLink
  createStub(dto: { userUuid: string; itemShareHash: ItemLinkHash }): ItemLink
}
