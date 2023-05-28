import { ContactServiceInterface } from './../Contact/Service/ContactServiceInterface'
import { Item } from '../Item/Item'
import { ItemConflict } from '../Item/ItemConflict'
import { ItemServiceInterface } from '../Item/ItemServiceInterface'
import { SyncItemsDTO } from './SyncItemsDTO'
import { SyncItemsResponse } from './SyncItemsResponse'
import { UseCaseInterface } from './UseCaseInterface'
import { VaultInviteServiceInterface } from '../VaultInvite/Service/VaultInviteServiceInterface'
import { VaultServiceInterface } from '../Vault/Service/VaultServiceInterface'

export class SyncItems implements UseCaseInterface {
  constructor(
    private itemService: ItemServiceInterface,
    private vaultService: VaultServiceInterface,
    private vaultInviteService: VaultInviteServiceInterface,
    private contactService: ContactServiceInterface,
  ) {}

  async execute(dto: SyncItemsDTO): Promise<SyncItemsResponse> {
    const getItemsResult = await this.itemService.getItems({
      userUuid: dto.userUuid,
      syncToken: dto.syncToken,
      vaultUuids: dto.vaultUuids,
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
    const isVaultExclusiveSync = dto.vaultUuids && dto.vaultUuids.length > 0
    if (this.isFirstSync(dto) && !isVaultExclusiveSync) {
      retrievedItems = await this.itemService.frontLoadKeysItemsToTop(dto.userUuid, retrievedItems)
    }

    const lastSyncTime = this.itemService.getLastSyncTime({
      syncToken: dto.syncToken,
      cursorToken: dto.cursorToken,
    })

    const vaults = await this.vaultService.getVaults({
      userUuid: dto.userUuid,
      lastSyncTime,
    })

    const vaultInvites = await this.vaultInviteService.getInvitesForUser({
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
      vaults,
      vaultInvites,
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
