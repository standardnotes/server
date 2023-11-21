import { ContentType, Result, UseCaseInterface } from '@standardnotes/domain-core'

import { Item } from '../../../Item/Item'
import { ItemConflict } from '../../../Item/ItemConflict'
import { SyncItemsDTO } from './SyncItemsDTO'
import { SyncItemsResponse } from './SyncItemsResponse'
import { GetItems } from '../GetItems/GetItems'
import { SaveItems } from '../SaveItems/SaveItems'
import { GetSharedVaults } from '../../SharedVaults/GetSharedVaults/GetSharedVaults'
import { GetSharedVaultInvitesSentToUser } from '../../SharedVaults/GetSharedVaultInvitesSentToUser/GetSharedVaultInvitesSentToUser'
import { GetMessagesSentToUser } from '../../Messaging/GetMessagesSentToUser/GetMessagesSentToUser'
import { GetUserNotifications } from '../../Messaging/GetUserNotifications/GetUserNotifications'
import { Logger } from 'winston'
import { ItemRepositoryInterface } from '../../../Item/ItemRepositoryInterface'

export class SyncItems implements UseCaseInterface<SyncItemsResponse> {
  constructor(
    private itemRepository: ItemRepositoryInterface,
    private getItemsUseCase: GetItems,
    private saveItemsUseCase: SaveItems,
    private getSharedVaultsUseCase: GetSharedVaults,
    private getSharedVaultInvitesSentToUserUseCase: GetSharedVaultInvitesSentToUser,
    private getMessagesSentToUser: GetMessagesSentToUser,
    private getUserNotifications: GetUserNotifications,
    private logger: Logger,
  ) {}

  async execute(dto: SyncItemsDTO): Promise<Result<SyncItemsResponse>> {
    try {
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

      let retrievedItems = this.filterOutSyncConflictsForConsecutiveSyncs(
        getItemsResult.items,
        saveItemsResult.conflicts,
      )
      const isSharedVaultExclusiveSync = dto.sharedVaultUuids && dto.sharedVaultUuids.length > 0
      if (this.isFirstSync(dto) && !isSharedVaultExclusiveSync) {
        retrievedItems = await this.frontLoadHighLoadingPriorityItemsToTop(dto.userUuid, retrievedItems)
      }

      const sharedVaultsOrError = await this.getSharedVaultsUseCase.execute({
        userUuid: dto.userUuid,
        includeDesignatedSurvivors: false,
        lastSyncTime: getItemsResult.lastSyncTime ?? undefined,
      })
      if (sharedVaultsOrError.isFailed()) {
        return Result.fail(sharedVaultsOrError.getError())
      }
      const sharedVaultsResult = sharedVaultsOrError.getValue()

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
        sharedVaults: sharedVaultsResult.sharedVaults,
        messages,
        notifications,
      }

      return Result.ok(syncResponse)
    } catch (error) {
      const itemHashUuids = dto.itemHashes.map((itemHash) => itemHash.props.uuid)
      this.logger.error(
        `Sync error for user ${dto.userUuid} syncing items ${itemHashUuids.join(',')}: ${(error as Error).message}`,
      )
      throw error
    }
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

  private async frontLoadHighLoadingPriorityItemsToTop(
    userUuid: string,
    retrievedItems: Array<Item>,
  ): Promise<Array<Item>> {
    const highPriorityItems = await this.itemRepository.findAll({
      userUuid,
      contentType: [ContentType.TYPES.ItemsKey, ContentType.TYPES.UserPrefs, ContentType.TYPES.Theme],
      sortBy: 'updated_at_timestamp',
      sortOrder: 'ASC',
    })

    const retrievedItemsIds: Array<string> = retrievedItems.map((item: Item) => item.id.toString())

    highPriorityItems.forEach((highPriorityItem: Item) => {
      if (retrievedItemsIds.indexOf(highPriorityItem.id.toString()) === -1) {
        retrievedItems.unshift(highPriorityItem)
      }
    })

    return retrievedItems
  }
}
