import { inject, injectable } from 'inversify'
import TYPES from '../../../Bootstrap/Types'
import { ProjectorInterface } from '../../../Projection/ProjectorInterface'
import { SyncItemsResponse } from '../../UseCase/SyncItemsResponse'
import { Item } from '../Item'
import { ItemConflict } from '../ItemConflict'
import { ItemHash } from '../ItemHash'
import { ItemProjection } from '../../../Projection/ItemProjection'
import { SyncResponse20161215 } from './SyncResponse20161215'
import { SyncResponseFactoryInterface } from './SyncResponseFactoryInterface'
import { ConflictType } from '@standardnotes/responses'

@injectable()
export class SyncResponseFactory20161215 implements SyncResponseFactoryInterface {
  private readonly LEGACY_MIN_CONFLICT_INTERVAL = 20_000_000

  constructor(@inject(TYPES.ItemProjector) private itemProjector: ProjectorInterface<Item, ItemProjection>) {}

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
        item: conflict.serverItem
          ? <ItemProjection>await this.itemProjector.projectFull(conflict.serverItem)
          : <ItemHash>conflict.unsavedItem,
        error: {
          tag: conflict.type,
        },
      })
    }

    const retrievedItems = []
    for (const item of pickOutConflictsResult.retrievedItems) {
      retrievedItems.push(<ItemProjection>await this.itemProjector.projectFull(item))
    }

    const savedItems = []
    for (const item of syncItemsResponse.savedItems) {
      savedItems.push(<ItemProjection>await this.itemProjector.projectFull(item))
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
    const savedIds: Array<string> = savedItems.map((savedItem: Item) => savedItem.uuid)
    const retrievedIds: Array<string> = retrievedItems.map((retrievedItem: Item) => retrievedItem.uuid)

    const conflictingIds = savedIds.filter((savedId) => retrievedIds.includes(savedId))

    for (const conflictingId of conflictingIds) {
      const savedItem = <Item>savedItems.find((item) => item.uuid === conflictingId)
      const conflictedItem = <Item>retrievedItems.find((item) => item.uuid === conflictingId)

      const difference = savedItem.updatedAtTimestamp - conflictedItem.updatedAtTimestamp

      if (Math.abs(difference) > this.LEGACY_MIN_CONFLICT_INTERVAL) {
        unsavedItems.push({
          serverItem: conflictedItem,
          type: ConflictType.ConflictingData,
        })
      }

      retrievedItems = retrievedItems.filter((retrievedItem: Item) => retrievedItem.uuid !== conflictingId)
    }

    return {
      retrievedItems,
      unsavedItems,
    }
  }
}
