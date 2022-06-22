import { Uuid } from '@standardnotes/common'

import { Item } from './Item'
import { ItemHash } from './ItemHash'

export interface ItemFactoryInterface {
  create(dto: { userUuid: string; itemHash: ItemHash; sessionUuid: Uuid | null }): Item
  createStub(dto: { userUuid: string; itemHash: ItemHash; sessionUuid: Uuid | null }): Item
}
