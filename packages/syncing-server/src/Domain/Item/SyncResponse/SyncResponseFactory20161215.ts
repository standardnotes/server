import { ConflictType } from '@standardnotes/responses'
import { MapperInterface } from '@standardnotes/domain-core'

import { Item } from '../Item'
import { ItemConflict } from '../ItemConflict'
import { ItemHash } from '../ItemHash'
import { SyncResponse20161215 } from './SyncResponse20161215'
import { SyncResponseFactoryInterface } from './SyncResponseFactoryInterface'
import { SyncItemsResponse } from '../../UseCase/Syncing/SyncItems/SyncItemsResponse'
import { ItemHttpRepresentation } from '../../../Mapping/Http/ItemHttpRepresentation'

export class SyncResponseFactory20161215 implements SyncResponseFactoryInterface {
  private readonly LEGACY_MIN_CONFLICT_INTERVAL = 20_000_000

  constructor(private mapper: MapperInterface<Item, ItemHttpRepresentation>) {}

  async createResponse(syncItemsResponse: SyncItemsResponse): Promise<SyncResponse20161215> {
    const conflicts = syncItemsResponse.conflicts.filter(
      (itemConflict: ItemConflict) => itemConflict.type === ConflictType.UuidConflict,
    )

    const pickOutConflictsResult = this.pickOutConflicts(
      syncItemsResponse.savedItems,
      syncItemsResponse.retrievedItems,
      conflicts,
    )

    const unsaved = []
    for (const conflict of pickOutConflictsResult.unsavedItems) {
      unsaved.push({
        item: conflict.serverItem ? this.mapper.toProjection(conflict.serverItem) : <ItemHash>conflict.unsavedItem,
        error: {
          tag: conflict.type,
        },
      })
    }

    const retrievedItems = []
    for (const item of pickOutConflictsResult.retrievedItems) {
      retrievedItems.push(this.mapper.toProjection(item))
    }

    const savedItems = []
    for (const item of syncItemsResponse.savedItems) {
      savedItems.push(this.mapper.toProjection(item))
    }

    return {
      retrieved_items: retrievedItems,
      saved_items: savedItems,
      unsaved,
      sync_token: syncItemsResponse.syncToken,
      cursor_token: syncItemsResponse.cursorToken,
    }
  }

  private pickOutConflicts(
    savedItems: Array<Item>,
    retrievedItems: Array<Item>,
    unsavedItems: Array<ItemConflict>,
  ): {
    unsavedItems: Array<ItemConflict>
    retrievedItems: Array<Item>
  } {
    const savedIds: Array<string> = savedItems.map((savedItem: Item) => savedItem.id.toString())
    const retrievedIds: Array<string> = retrievedItems.map((retrievedItem: Item) => retrievedItem.id.toString())

    const conflictingIds = savedIds.filter((savedId) => retrievedIds.includes(savedId))

    for (const conflictingId of conflictingIds) {
      const savedItem = <Item>savedItems.find((item) => item.id.toString() === conflictingId)
      const conflictedItem = <Item>retrievedItems.find((item) => item.id.toString() === conflictingId)

      const difference = savedItem.props.timestamps.updatedAt - conflictedItem.props.timestamps.updatedAt

      if (Math.abs(difference) > this.LEGACY_MIN_CONFLICT_INTERVAL) {
        unsavedItems.push({
          serverItem: conflictedItem,
          type: ConflictType.ConflictingData,
        })
      }

      retrievedItems = retrievedItems.filter((retrievedItem: Item) => retrievedItem.id.toString() !== conflictingId)
    }

    return {
      retrievedItems,
      unsavedItems,
    }
  }
}
