import { ContactServiceInterface } from './../Contact/Service/ContactServiceInterface'
import { Item } from '../Item/Item'
import { ItemConflict } from '../Item/ItemConflict'
import { ItemServiceInterface } from '../Item/ItemServiceInterface'
import { SyncItemsDTO } from './SyncItemsDTO'
import { SyncItemsResponse } from './SyncItemsResponse'
import { UseCaseInterface } from './UseCaseInterface'
import { SharedVaultInviteServiceInterface } from '../SharedVaultInvite/Service/SharedVaultInviteServiceInterface'
import { SharedVaultServiceInterface } from '../SharedVault/Service/SharedVaultServiceInterface'

export class SyncItems implements UseCaseInterface {
  constructor(
    private itemService: ItemServiceInterface,
    private sharedVaultService: SharedVaultServiceInterface,
    private sharedVaultInviteService: SharedVaultInviteServiceInterface,
    private contactService: ContactServiceInterface,
  ) {}

  async execute(dto: SyncItemsDTO): Promise<SyncItemsResponse> {
    const getItemsResult = await this.itemService.getItems({
      userUuid: dto.userUuid,
      syncToken: dto.syncToken,
      sharedVaultUuids: dto.sharedVaultUuids,
      cursorToken: dto.cursorToken,
      limit: dto.limit,
      contentType: dto.contentType,
    })

    const saveItemsResult = await this.itemService.saveItems({
      itemHashes: dto.itemHashes,
      userUuid: dto.userUuid,
      apiVersion: dto.apiVersion,
      snjsVersion: dto.snjsVersion,
      readOnlyAccess: dto.readOnlyAccess,
      sessionUuid: dto.sessionUuid,
    })

    let retrievedItems = this.filterOutSyncConflictsForConsecutiveSyncs(getItemsResult.items, saveItemsResult.conflicts)
    const isSharedVaultExclusiveSync = dto.sharedVaultUuids && dto.sharedVaultUuids.length > 0
    if (this.isFirstSync(dto) && !isSharedVaultExclusiveSync) {
      retrievedItems = await this.itemService.frontLoadKeysItemsToTop(dto.userUuid, retrievedItems)
    }

    const lastSyncTime = this.itemService.getLastSyncTime({
      syncToken: dto.syncToken,
      cursorToken: dto.cursorToken,
    })

    const sharedVaults = await this.sharedVaultService.getSharedVaults({
      userUuid: dto.userUuid,
      lastSyncTime,
    })

    const sharedVaultInvites = await this.sharedVaultInviteService.getInvitesForUser({
      userUuid: dto.userUuid,
      lastSyncTime,
    })

    const contacts = await this.contactService.getUserContacts({
      userUuid: dto.userUuid,
      lastSyncTime: lastSyncTime,
    })

    const syncResponse: SyncItemsResponse = {
      retrievedItems,
      syncToken: saveItemsResult.syncToken,
      savedItems: saveItemsResult.savedItems,
      conflicts: saveItemsResult.conflicts,
      cursorToken: getItemsResult.cursorToken,
      sharedVaults,
      sharedVaultInvites,
      contacts,
    }

    return syncResponse
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
