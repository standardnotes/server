import { Uuid } from '@standardnotes/domain-core'
import { ReadStream } from 'fs'

import { Item } from './Item'
import { ItemQuery } from './ItemQuery'
import { ExtendedIntegrityPayload } from './ExtendedIntegrityPayload'

export interface ItemRepositoryInterface {
  deleteByUserUuid(userUuid: string): Promise<void>
  findAll(query: ItemQuery): Promise<Item[]>
  findAllRaw<T>(query: ItemQuery): Promise<T[]>
  streamAll(query: ItemQuery): Promise<ReadStream>
  countAll(query: ItemQuery): Promise<number>
  findContentSizeForComputingTransferLimit(
    query: ItemQuery,
  ): Promise<Array<{ uuid: string; contentSize: number | null }>>
  findDatesForComputingIntegrityHash(userUuid: string): Promise<Array<{ updated_at_timestamp: number }>>
  findItemsForComputingIntegrityPayloads(userUuid: string): Promise<ExtendedIntegrityPayload[]>
  findByUuidAndUserUuid(uuid: string, userUuid: string): Promise<Item | null>
  findByUuid(uuid: Uuid, noAssociations: boolean): Promise<Item | null>
  remove(item: Item): Promise<void>
  save(item: Item): Promise<void>
  markItemsAsDeleted(itemUuids: Array<string>, updatedAtTimestamp: number): Promise<void>
  updateContentSize(itemUuid: string, contentSize: number): Promise<void>
}
