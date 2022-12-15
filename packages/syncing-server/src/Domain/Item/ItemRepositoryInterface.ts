import { Item } from './Item'
import { ItemQuery } from './ItemQuery'
import { ReadStream } from 'fs'
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
  findByUuid(uuid: string): Promise<Item | null>
  remove(item: Item): Promise<Item>
  save(item: Item): Promise<Item>
  markItemsAsDeleted(itemUuids: Array<string>, updatedAtTimestamp: number): Promise<void>
  updateContentSize(itemUuid: string, contentSize: number): Promise<void>
}
