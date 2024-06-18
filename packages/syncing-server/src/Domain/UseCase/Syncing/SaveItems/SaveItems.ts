import { Result, UseCaseInterface, Uuid } from '@standardnotes/domain-core'

import { SaveItemsResult } from './SaveItemsResult'
import { SaveItemsDTO } from './SaveItemsDTO'
import { Item } from '../../../Item/Item'
import { ItemConflict } from '../../../Item/ItemConflict'
import { ConflictType } from '@standardnotes/responses'
import { Time, TimerInterface } from '@standardnotes/time'
import { Logger } from 'winston'
import { ItemSaveValidatorInterface } from '../../../Item/SaveValidator/ItemSaveValidatorInterface'
import { SaveNewItem } from '../SaveNewItem/SaveNewItem'
import { UpdateExistingItem } from '../UpdateExistingItem/UpdateExistingItem'
import { ItemRepositoryInterface } from '../../../Item/ItemRepositoryInterface'
import { SendEventToClient } from '../SendEventToClient/SendEventToClient'
import { DomainEventFactoryInterface } from '../../../Event/DomainEventFactoryInterface'
import { SendEventToClients } from '../SendEventToClients/SendEventToClients'
import { CheckForContentLimit } from '../CheckForContentLimit/CheckForContentLimit'

export class SaveItems implements UseCaseInterface<SaveItemsResult> {
  private readonly SYNC_TOKEN_VERSION = 2

  constructor(
    private itemSaveValidator: ItemSaveValidatorInterface,
    private itemRepository: ItemRepositoryInterface,
    private timer: TimerInterface,
    private saveNewItem: SaveNewItem,
    private updateExistingItem: UpdateExistingItem,
    private sendEventToClient: SendEventToClient,
    private sendEventToClients: SendEventToClients,
    private domainEventFactory: DomainEventFactoryInterface,
    private checkForContentLimit: CheckForContentLimit,
    private logger: Logger,
  ) {}

  async execute(dto: SaveItemsDTO): Promise<Result<SaveItemsResult>> {
    const savedItems: Array<Item> = []
    const conflicts: Array<ItemConflict> = []

    if (dto.hasContentLimit) {
      const checkForContentLimitResult = await this.checkForContentLimit.execute({
        userUuid: dto.userUuid,
        itemsBeingModified: dto.itemHashes,
      })
      if (checkForContentLimitResult.isFailed()) {
        this.logger.warn(`Checking for content limit failed. Error: ${checkForContentLimitResult.getError()}`, {
          userId: dto.userUuid,
        })

        return Result.fail(checkForContentLimitResult.getError())
      }
    }

    const lastUpdatedTimestamp = this.timer.getTimestampInMicroseconds()

    for (const itemHash of dto.itemHashes) {
      const itemUuidOrError = Uuid.create(itemHash.props.uuid)
      if (itemUuidOrError.isFailed()) {
        conflicts.push({
          unsavedItem: itemHash,
          type: ConflictType.UuidConflict,
        })

        continue
      }
      const itemUuid = itemUuidOrError.getValue()

      const existingItem = await this.itemRepository.findByUuid(itemUuid)

      if (dto.readOnlyAccess) {
        conflicts.push({
          unsavedItem: itemHash,
          serverItem: existingItem ?? undefined,
          type: ConflictType.ReadOnlyError,
        })

        continue
      }

      const processingResult = await this.itemSaveValidator.validate({
        userUuid: dto.userUuid,
        apiVersion: dto.apiVersion,
        itemHash,
        existingItem,
        snjsVersion: dto.snjsVersion,
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
        const udpatedItemOrError = await this.updateExistingItem.execute({
          existingItem,
          itemHash,
          sessionUuid: dto.sessionUuid,
          performingUserUuid: dto.userUuid,
          isFreeUser: dto.isFreeUser,
        })
        if (udpatedItemOrError.isFailed()) {
          this.logger.error(
            `[${dto.userUuid}] Updating item ${itemHash.props.uuid} failed. Error: ${udpatedItemOrError.getError()}`,
          )

          conflicts.push({
            unsavedItem: itemHash,
            type: ConflictType.UuidConflict,
          })

          continue
        }
        const updatedItem = udpatedItemOrError.getValue()

        savedItems.push(updatedItem)
      } else {
        try {
          const newItemOrError = await this.saveNewItem.execute({
            userUuid: dto.userUuid,
            itemHash,
            sessionUuid: dto.sessionUuid,
          })
          if (newItemOrError.isFailed()) {
            this.logger.error(
              `[${dto.userUuid}] Saving item ${itemHash.props.uuid} failed. Error: ${newItemOrError.getError()}`,
            )

            conflicts.push({
              unsavedItem: itemHash,
              type: ConflictType.UuidConflict,
            })

            continue
          }
          const newItem = newItemOrError.getValue()

          savedItems.push(newItem)
        } catch (error) {
          this.logger.error(
            `[${dto.userUuid}] Saving item ${itemHash.props.uuid} failed. Error: ${(error as Error).message}`,
          )

          conflicts.push({
            unsavedItem: itemHash,
            type: ConflictType.UuidConflict,
          })

          continue
        }
      }
    }

    const syncToken = this.calculateSyncToken(lastUpdatedTimestamp, savedItems)

    await this.notifyOtherClientsOfTheUserThatItemsChanged(dto, savedItems, lastUpdatedTimestamp)

    return Result.ok({
      savedItems,
      conflicts,
      syncToken,
    })
  }

  private async notifyOtherClientsOfTheUserThatItemsChanged(
    dto: SaveItemsDTO,
    savedItems: Item[],
    lastUpdatedTimestamp: number,
  ): Promise<void> {
    if (savedItems.length === 0 || !dto.sessionUuid) {
      return
    }

    const itemsChangedEvent = this.domainEventFactory.createItemsChangedOnServerEvent({
      userUuid: dto.userUuid,
      sessionUuid: dto.sessionUuid,
      timestamp: lastUpdatedTimestamp,
    })
    const result = await this.sendEventToClient.execute({
      userUuid: dto.userUuid,
      originatingSessionUuid: dto.sessionUuid,
      event: itemsChangedEvent,
    })
    /* istanbul ignore next */
    if (result.isFailed()) {
      this.logger.error(`Sending items changed event to client failed. Error: ${result.getError()}`, {
        userId: dto.userUuid,
      })
    }

    const sharedVaultUuidsMap = new Map<string, boolean>()
    for (const item of savedItems) {
      if (item.isAssociatedWithASharedVault()) {
        sharedVaultUuidsMap.set((item.sharedVaultUuid as Uuid).value, true)
      }
    }
    const sharedVaultUuids = Array.from(sharedVaultUuidsMap.keys())
    for (const sharedVaultUuid of sharedVaultUuids) {
      const result = await this.sendEventToClients.execute({
        sharedVaultUuid,
        event: itemsChangedEvent,
        originatingUserUuid: dto.userUuid,
      })
      /* istanbul ignore next */
      if (result.isFailed()) {
        this.logger.error(`Sending items changed event to clients failed. Error: ${result.getError()}`, {
          userId: dto.userUuid,
          sharedVaultUuid,
        })
      }
    }
  }

  private calculateSyncToken(lastUpdatedTimestamp: number, savedItems: Array<Item>): string {
    if (savedItems.length) {
      const sortedItems = savedItems.sort((itemA: Item, itemB: Item) => {
        return itemA.props.timestamps.updatedAt > itemB.props.timestamps.updatedAt ? 1 : -1
      })
      lastUpdatedTimestamp = sortedItems[sortedItems.length - 1].props.timestamps.updatedAt
    }

    const lastUpdatedTimestampWithMicrosecondPreventingSyncDoubles = lastUpdatedTimestamp + 1

    return Buffer.from(
      `${this.SYNC_TOKEN_VERSION}:${
        lastUpdatedTimestampWithMicrosecondPreventingSyncDoubles / Time.MicrosecondsInASecond
      }`,
      'utf-8',
    ).toString('base64')
  }
}
