import { ContentType, Result, UseCaseInterface } from '@standardnotes/domain-core'

import { Item } from '../../../Item/Item'
import { ItemConflict } from '../../../Item/ItemConflict'
import { SyncItemsDTO } from './SyncItemsDTO'
import { SyncItemsResponse } from './SyncItemsResponse'
import { ItemRepositoryInterface } from '../../../Item/ItemRepositoryInterface'
import { GetItems } from '../GetItems/GetItems'
import { SaveItems } from '../SaveItems/SaveItems'
import { GetSharedVaults } from '../../SharedVaults/GetSharedVaults/GetSharedVaults'
import { GetSharedVaultInvitesSentToUser } from '../../SharedVaults/GetSharedVaultInvitesSentToUser/GetSharedVaultInvitesSentToUser'
import { GetMessagesSentToUser } from '../../Messaging/GetMessagesSentToUser/GetMessagesSentToUser'
import { GetUserNotifications } from '../../Messaging/GetUserNotifications/GetUserNotifications'

export class SyncItems implements UseCaseInterface<SyncItemsResponse> {
  constructor(
    private itemRepository: ItemRepositoryInterface,
    private getItemsUseCase: GetItems,
    private saveItemsUseCase: SaveItems,
    private getSharedVaultsUseCase: GetSharedVaults,
    private getSharedVaultInvitesSentToUserUseCase: GetSharedVaultInvitesSentToUser,
    private getMessagesSentToUser: GetMessagesSentToUser,
    private getUserNotifications: GetUserNotifications,
  ) {}

  async execute(dto: SyncItemsDTO): Promise<Result<SyncItemsResponse>> {
    const getItemsResultOrError = await this.getItemsUseCase.execute({
      userUuid: dto.userUuid,
      syncToken: dto.syncToken,
      cursorToken: dto.cursorToken,
      limit: dto.limit,
      contentType: dto.contentType,
      sharedVaultUuids: dto.sharedVaultUuids,
    })
    if (getItemsResultOrError.isFailed()) {
      return Result.fail(getItemsResultOrError.getError())
    }
    const getItemsResult = getItemsResultOrError.getValue()

    const saveItemsResultOrError = await this.saveItemsUseCase.execute({
      itemHashes: dto.itemHashes,
      userUuid: dto.userUuid,
      apiVersion: dto.apiVersion,
      readOnlyAccess: dto.readOnlyAccess,
      sessionUuid: dto.sessionUuid,
      snjsVersion: dto.snjsVersion,
    })
    if (saveItemsResultOrError.isFailed()) {
      return Result.fail(saveItemsResultOrError.getError())
    }
    const saveItemsResult = saveItemsResultOrError.getValue()

    let retrievedItems = this.filterOutSyncConflictsForConsecutiveSyncs(getItemsResult.items, saveItemsResult.conflicts)
    const isSharedVaultExclusiveSync = dto.sharedVaultUuids && dto.sharedVaultUuids.length > 0
    if (this.isFirstSync(dto) && !isSharedVaultExclusiveSync) {
      retrievedItems = await this.frontLoadKeysItemsToTop(dto.userUuid, retrievedItems)
    }

    const sharedVaultsOrError = await this.getSharedVaultsUseCase.execute({
      userUuid: dto.userUuid,
      lastSyncTime: getItemsResult.lastSyncTime ?? undefined,
    })
    if (sharedVaultsOrError.isFailed()) {
      return Result.fail(sharedVaultsOrError.getError())
    }
    const sharedVaults = sharedVaultsOrError.getValue()

    const sharedVaultInvitesOrError = await this.getSharedVaultInvitesSentToUserUseCase.execute({
      userUuid: dto.userUuid,
      lastSyncTime: getItemsResult.lastSyncTime ?? undefined,
    })
    if (sharedVaultInvitesOrError.isFailed()) {
      return Result.fail(sharedVaultInvitesOrError.getError())
    }
    const sharedVaultInvites = sharedVaultInvitesOrError.getValue()

    const messagesOrError = await this.getMessagesSentToUser.execute({
      recipientUuid: dto.userUuid,
      lastSyncTime: getItemsResult.lastSyncTime ?? undefined,
    })
    if (messagesOrError.isFailed()) {
      return Result.fail(messagesOrError.getError())
    }
    const messages = messagesOrError.getValue()

    const notificationsOrError = await this.getUserNotifications.execute({
      userUuid: dto.userUuid,
      lastSyncTime: getItemsResult.lastSyncTime ?? undefined,
    })
    if (notificationsOrError.isFailed()) {
      return Result.fail(notificationsOrError.getError())
    }
    const notifications = notificationsOrError.getValue()

    const syncResponse: SyncItemsResponse = {
      retrievedItems,
      syncToken: saveItemsResult.syncToken,
      savedItems: saveItemsResult.savedItems,
      conflicts: saveItemsResult.conflicts,
      cursorToken: getItemsResult.cursorToken,
      sharedVaultInvites,
      sharedVaults,
      messages,
      notifications,
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
        syncConflictIds.push(conflict.serverItem.id.toString())
      }
    })

    return retrievedItems.filter((item: Item) => syncConflictIds.indexOf(item.id.toString()) === -1)
  }

  private async frontLoadKeysItemsToTop(userUuid: string, retrievedItems: Array<Item>): Promise<Array<Item>> {
    const itemsKeys = await this.itemRepository.findAll({
      userUuid,
      contentType: ContentType.TYPES.ItemsKey,
      sortBy: 'updated_at_timestamp',
      sortOrder: 'ASC',
    })

    const retrievedItemsIds: Array<string> = retrievedItems.map((item: Item) => item.id.toString())

    itemsKeys.forEach((itemKey: Item) => {
      if (retrievedItemsIds.indexOf(itemKey.id.toString()) === -1) {
        retrievedItems.unshift(itemKey)
      }
    })

    return retrievedItems
  }
}
