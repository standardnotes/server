import { DomainEventPublisherInterface } from '@standardnotes/domain-events'
import { Time, TimerInterface } from '@standardnotes/time'
import { ContentType } from '@standardnotes/common'
import { inject, injectable } from 'inversify'
import { Logger } from 'winston'

import TYPES from '../../Bootstrap/Types'
import { DomainEventFactoryInterface } from '../Event/DomainEventFactoryInterface'
import { GetItemsDTO } from './GetItemsDTO'
import { GetItemsResult } from './GetItemsResult'
import { Item } from './Item'
import { ItemConflict } from './ItemConflict'
import { ItemFactoryInterface } from './ItemFactoryInterface'
import { ItemHash } from './ItemHash'
import { ItemQuery } from './ItemQuery'
import { ItemRepositoryInterface } from './ItemRepositoryInterface'
import { ItemServiceInterface } from './ItemServiceInterface'
import { SaveItemsDTO } from './SaveItemsDTO'
import { SaveItemsResult } from './SaveItemsResult'
import { ItemSaveValidatorInterface } from './SaveValidator/ItemSaveValidatorInterface'
import { ConflictType } from '@standardnotes/responses'
import { ItemTransferCalculatorInterface } from './ItemTransferCalculatorInterface'
import { ProjectorInterface } from '../../Projection/ProjectorInterface'
import { ItemProjection } from '../../Projection/ItemProjection'

@injectable()
export class ItemService implements ItemServiceInterface {
  private readonly DEFAULT_ITEMS_LIMIT = 150
  private readonly SYNC_TOKEN_VERSION = 2

  constructor(
    @inject(TYPES.ItemSaveValidator) private itemSaveValidator: ItemSaveValidatorInterface,
    @inject(TYPES.ItemFactory) private itemFactory: ItemFactoryInterface,
    @inject(TYPES.ItemRepository) private itemRepository: ItemRepositoryInterface,
    @inject(TYPES.DomainEventPublisher) private domainEventPublisher: DomainEventPublisherInterface,
    @inject(TYPES.DomainEventFactory) private domainEventFactory: DomainEventFactoryInterface,
    @inject(TYPES.REVISIONS_FREQUENCY) private revisionFrequency: number,
    @inject(TYPES.CONTENT_SIZE_TRANSFER_LIMIT) private contentSizeTransferLimit: number,
    @inject(TYPES.ItemTransferCalculator) private itemTransferCalculator: ItemTransferCalculatorInterface,
    @inject(TYPES.Timer) private timer: TimerInterface,
    @inject(TYPES.ItemProjector) private itemProjector: ProjectorInterface<Item, ItemProjection>,
    @inject(TYPES.MAX_ITEMS_LIMIT) private maxItemsSyncLimit: number,
    @inject(TYPES.Logger) private logger: Logger,
  ) {}

  async getItems(dto: GetItemsDTO): Promise<GetItemsResult> {
    const lastSyncTime = this.getLastSyncTime(dto)
    const syncTimeComparison = dto.cursorToken ? '>=' : '>'
    const limit = dto.limit === undefined || dto.limit < 1 ? this.DEFAULT_ITEMS_LIMIT : dto.limit
    const upperBoundLimit = limit < this.maxItemsSyncLimit ? limit : this.maxItemsSyncLimit

    const itemQuery: ItemQuery = {
      userUuid: dto.userUuid,
      lastSyncTime,
      syncTimeComparison,
      contentType: dto.contentType,
      deleted: lastSyncTime ? undefined : false,
      sortBy: 'updated_at_timestamp',
      sortOrder: 'ASC',
      limit: upperBoundLimit,
    }

    const itemUuidsToFetch = await this.itemTransferCalculator.computeItemUuidsToFetch(
      itemQuery,
      this.contentSizeTransferLimit,
    )
    let items: Array<Item> = []
    if (itemUuidsToFetch.length > 0) {
      items = await this.itemRepository.findAll({
        uuids: itemUuidsToFetch,
        sortBy: 'updated_at_timestamp',
        sortOrder: 'ASC',
      })
    }
    const totalItemsCount = await this.itemRepository.countAll(itemQuery)

    let cursorToken = undefined
    if (totalItemsCount > upperBoundLimit) {
      const lastSyncTime = items[items.length - 1].updatedAtTimestamp / Time.MicrosecondsInASecond
      cursorToken = Buffer.from(`${this.SYNC_TOKEN_VERSION}:${lastSyncTime}`, 'utf-8').toString('base64')
    }

    return {
      items,
      cursorToken,
    }
  }

  async saveItems(dto: SaveItemsDTO): Promise<SaveItemsResult> {
    const savedItems: Array<Item> = []
    const conflicts: Array<ItemConflict> = []

    const lastUpdatedTimestamp = this.timer.getTimestampInMicroseconds()

    for (const itemHash of dto.itemHashes) {
      if (dto.readOnlyAccess) {
        conflicts.push({
          unsavedItem: itemHash,
          type: ConflictType.ReadOnlyError,
        })

        continue
      }

      const existingItem = await this.itemRepository.findByUuid(itemHash.uuid)
      const processingResult = await this.itemSaveValidator.validate({
        userUuid: dto.userUuid,
        apiVersion: dto.apiVersion,
        itemHash,
        existingItem,
      })
      if (!processingResult.passed) {
        if (processingResult.conflict) {
          conflicts.push(processingResult.conflict)
        }
        if (processingResult.skipped) {
          savedItems.push(processingResult.skipped)
        }

        continue
      }

      if (existingItem) {
        const updatedItem = await this.updateExistingItem({
          existingItem,
          itemHash,
          sessionUuid: dto.sessionUuid,
        })
        savedItems.push(updatedItem)
      } else {
        try {
          const newItem = await this.saveNewItem({ userUuid: dto.userUuid, itemHash, sessionUuid: dto.sessionUuid })
          savedItems.push(newItem)
        } catch (error) {
          this.logger.error(`[${dto.userUuid}] Saving item ${itemHash.uuid} failed. Error: ${(error as Error).message}`)

          conflicts.push({
            unsavedItem: itemHash,
            type: ConflictType.UuidConflict,
          })

          continue
        }
      }
    }

    const syncToken = this.calculateSyncToken(lastUpdatedTimestamp, savedItems)

    return {
      savedItems,
      conflicts,
      syncToken,
    }
  }

  async frontLoadKeysItemsToTop(userUuid: string, retrievedItems: Array<Item>): Promise<Array<Item>> {
    const itemsKeys = await this.itemRepository.findAll({
      userUuid,
      contentType: ContentType.ItemsKey,
      sortBy: 'updated_at_timestamp',
      sortOrder: 'ASC',
    })

    const retrievedItemsIds: Array<string> = retrievedItems.map((item: Item) => item.uuid)

    itemsKeys.forEach((itemKey: Item) => {
      if (retrievedItemsIds.indexOf(itemKey.uuid) === -1) {
        retrievedItems.unshift(itemKey)
      }
    })

    return retrievedItems
  }

  private calculateSyncToken(lastUpdatedTimestamp: number, savedItems: Array<Item>): string {
    if (savedItems.length) {
      const sortedItems = savedItems.sort((itemA: Item, itemB: Item) => {
        return itemA.updatedAtTimestamp > itemB.updatedAtTimestamp ? 1 : -1
      })
      lastUpdatedTimestamp = sortedItems[sortedItems.length - 1].updatedAtTimestamp
    }

    const lastUpdatedTimestampWithMicrosecondPreventingSyncDoubles = lastUpdatedTimestamp + 1

    return Buffer.from(
      `${this.SYNC_TOKEN_VERSION}:${
        lastUpdatedTimestampWithMicrosecondPreventingSyncDoubles / Time.MicrosecondsInASecond
      }`,
      'utf-8',
    ).toString('base64')
  }

  private async updateExistingItem(dto: {
    existingItem: Item
    itemHash: ItemHash
    sessionUuid: string | null
  }): Promise<Item> {
    dto.existingItem.updatedWithSession = dto.sessionUuid
    dto.existingItem.contentSize = 0
    if (dto.itemHash.content) {
      dto.existingItem.content = dto.itemHash.content
    }
    if (dto.itemHash.content_type) {
      dto.existingItem.contentType = dto.itemHash.content_type
    }
    if (dto.itemHash.deleted !== undefined) {
      dto.existingItem.deleted = dto.itemHash.deleted
    }
    let wasMarkedAsDuplicate = false
    if (dto.itemHash.duplicate_of) {
      wasMarkedAsDuplicate = !dto.existingItem.duplicateOf
      dto.existingItem.duplicateOf = dto.itemHash.duplicate_of
    }
    if (dto.itemHash.auth_hash) {
      dto.existingItem.authHash = dto.itemHash.auth_hash
    }
    if (dto.itemHash.enc_item_key) {
      dto.existingItem.encItemKey = dto.itemHash.enc_item_key
    }
    if (dto.itemHash.items_key_id) {
      dto.existingItem.itemsKeyId = dto.itemHash.items_key_id
    }

    const updatedAt = this.timer.getTimestampInMicroseconds()
    const secondsFromLastUpdate = this.timer.convertMicrosecondsToSeconds(
      updatedAt - dto.existingItem.updatedAtTimestamp,
    )

    if (dto.itemHash.created_at_timestamp) {
      dto.existingItem.createdAtTimestamp = dto.itemHash.created_at_timestamp
      dto.existingItem.createdAt = this.timer.convertMicrosecondsToDate(dto.itemHash.created_at_timestamp)
    } else if (dto.itemHash.created_at) {
      dto.existingItem.createdAtTimestamp = this.timer.convertStringDateToMicroseconds(dto.itemHash.created_at)
      dto.existingItem.createdAt = this.timer.convertStringDateToDate(dto.itemHash.created_at)
    }

    dto.existingItem.updatedAtTimestamp = updatedAt
    dto.existingItem.updatedAt = this.timer.convertMicrosecondsToDate(updatedAt)

    dto.existingItem.contentSize = Buffer.byteLength(JSON.stringify(this.itemProjector.projectFull(dto.existingItem)))

    if (dto.itemHash.deleted === true) {
      dto.existingItem.deleted = true
      dto.existingItem.content = null
      dto.existingItem.contentSize = 0
      dto.existingItem.encItemKey = null
      dto.existingItem.authHash = null
      dto.existingItem.itemsKeyId = null
    }

    const savedItem = await this.itemRepository.save(dto.existingItem)

    if (secondsFromLastUpdate >= this.revisionFrequency) {
      if ([ContentType.Note, ContentType.File].includes(savedItem.contentType as ContentType)) {
        await this.domainEventPublisher.publish(
          this.domainEventFactory.createItemRevisionCreationRequested(savedItem.uuid, savedItem.userUuid),
        )
      }
    }

    if (wasMarkedAsDuplicate) {
      await this.domainEventPublisher.publish(
        this.domainEventFactory.createDuplicateItemSyncedEvent(savedItem.uuid, savedItem.userUuid),
      )
    }

    return savedItem
  }

  private async saveNewItem(dto: { userUuid: string; itemHash: ItemHash; sessionUuid: string | null }): Promise<Item> {
    const newItem = this.itemFactory.create(dto)

    const savedItem = await this.itemRepository.save(newItem)

    if ([ContentType.Note, ContentType.File].includes(savedItem.contentType as ContentType)) {
      await this.domainEventPublisher.publish(
        this.domainEventFactory.createItemRevisionCreationRequested(savedItem.uuid, savedItem.userUuid),
      )
    }

    if (savedItem.duplicateOf) {
      await this.domainEventPublisher.publish(
        this.domainEventFactory.createDuplicateItemSyncedEvent(savedItem.uuid, savedItem.userUuid),
      )
    }

    return savedItem
  }

  private getLastSyncTime(dto: GetItemsDTO): number | undefined {
    let token = dto.syncToken
    if (dto.cursorToken !== undefined && dto.cursorToken !== null) {
      token = dto.cursorToken
    }

    if (!token) {
      return undefined
    }

    const decodedToken = Buffer.from(token, 'base64').toString('utf-8')

    const tokenParts = decodedToken.split(':')
    const version = tokenParts.shift()

    switch (version) {
      case '1':
        return this.timer.convertStringDateToMicroseconds(tokenParts.join(':'))
      case '2':
        return +tokenParts[0] * Time.MicrosecondsInASecond
      default:
        throw Error('Sync token is missing version part')
    }
  }
}
