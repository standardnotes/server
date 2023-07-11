import { Result, UseCaseInterface } from '@standardnotes/domain-core'
import { Item } from '../../../Item/Item'
import { ItemConflict } from '../../../Item/ItemConflict'
import { ItemServiceInterface } from '../../../Item/ItemServiceInterface'
import { SyncItemsDTO } from './SyncItemsDTO'
import { SyncItemsResponse } from './SyncItemsResponse'

export class SyncItems implements UseCaseInterface<SyncItemsResponse> {
  constructor(private itemService: ItemServiceInterface) {}

  async execute(dto: SyncItemsDTO): Promise<Result<SyncItemsResponse>> {
    const getItemsResult = await this.itemService.getItems({
      userUuid: dto.userUuid,
      syncToken: dto.syncToken,
      cursorToken: dto.cursorToken,
      limit: dto.limit,
      contentType: dto.contentType,
    })

    const saveItemsResult = await this.itemService.saveItems({
      itemHashes: dto.itemHashes,
      userUuid: dto.userUuid,
      apiVersion: dto.apiVersion,
      readOnlyAccess: dto.readOnlyAccess,
      sessionUuid: dto.sessionUuid,
    })

    let retrievedItems = this.filterOutSyncConflictsForConsecutiveSyncs(getItemsResult.items, saveItemsResult.conflicts)
    if (this.isFirstSync(dto)) {
      retrievedItems = await this.itemService.frontLoadKeysItemsToTop(dto.userUuid, retrievedItems)
    }

    const syncResponse: SyncItemsResponse = {
      retrievedItems,
      syncToken: saveItemsResult.syncToken,
      savedItems: saveItemsResult.savedItems,
      conflicts: saveItemsResult.conflicts,
      cursorToken: getItemsResult.cursorToken,
    }

    return Result.ok(syncResponse)
  }

  private isFirstSync(dto: SyncItemsDTO): boolean {
    return dto.syncToken === undefined || dto.syncToken === null
  }

  private filterOutSyncConflictsForConsecutiveSyncs(
    retrievedItems: Array<Item>,
    conflicts: Array<ItemConflict>,
  ): Array<Item> {
    const syncConflictIds: Array<string> = []
    conflicts.forEach((conflict: ItemConflict) => {
      if (conflict.type === 'sync_conflict' && conflict.serverItem) {
        syncConflictIds.push(conflict.serverItem.uuid)
      }
    })

    return retrievedItems.filter((item: Item) => syncConflictIds.indexOf(item.uuid) === -1)
  }
}
