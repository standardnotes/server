import { Uuid } from '@standardnotes/domain-core'

import { Item } from './Item'
import { ItemQuery } from './ItemQuery'
import { ExtendedIntegrityPayload } from './ExtendedIntegrityPayload'
import { ItemContentSizeDescriptor } from './ItemContentSizeDescriptor'

export interface ItemRepositoryInterface {
  deleteByUserUuidAndNotInSharedVault(userUuid: Uuid): Promise<void>
  deleteByUserUuidInSharedVaults(userUuid: Uuid, sharedVaultUuids: Uuid[]): Promise<void>
  findAll(query: ItemQuery): Promise<Item[]>
  countAll(query: ItemQuery): Promise<number>
  findContentSizeForComputingTransferLimit(query: ItemQuery): Promise<Array<ItemContentSizeDescriptor>>
  findDatesForComputingIntegrityHash(userUuid: string): Promise<Array<{ updated_at_timestamp: number }>>
  findItemsForComputingIntegrityPayloads(userUuid: string): Promise<ExtendedIntegrityPayload[]>
  findByUuidAndUserUuid(uuid: string, userUuid: string): Promise<Item | null>
  findByUuid(uuid: Uuid): Promise<Item | null>
  remove(item: Item): Promise<void>
  removeByUuid(uuid: Uuid): Promise<void>
  save(item: Item): Promise<void>
  markItemsAsDeleted(itemUuids: Array<string>, updatedAtTimestamp: number): Promise<void>
  updateContentSize(itemUuid: string, contentSize: number): Promise<void>
  unassignFromSharedVault(sharedVaultUuid: Uuid): Promise<void>
  updateSharedVaultOwner(dto: { sharedVaultUuid: Uuid; fromOwnerUuid: Uuid; toOwnerUuid: Uuid }): Promise<void>
}
