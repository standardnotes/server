import {
  ContentType,
  Dates,
  Result,
  Timestamps,
  UniqueEntityId,
  UseCaseInterface,
  Uuid,
  Validator,
} from '@standardnotes/domain-core'
import { TimerInterface } from '@standardnotes/time'
import { DomainEventPublisherInterface } from '@standardnotes/domain-events'

import { Item } from '../../../Item/Item'
import { SaveNewItemDTO } from './SaveNewItemDTO'
import { DomainEventFactoryInterface } from '../../../Event/DomainEventFactoryInterface'
import { SharedVaultAssociation } from '../../../SharedVault/SharedVaultAssociation'
import { KeySystemAssociation } from '../../../KeySystem/KeySystemAssociation'
import { ItemRepositoryInterface } from '../../../Item/ItemRepositoryInterface'
import { MetricsStoreInterface } from '../../../Metrics/MetricsStoreInterface'
import { Metric } from '../../../Metrics/Metric'

export class SaveNewItem implements UseCaseInterface<Item> {
  constructor(
    private itemRepository: ItemRepositoryInterface,
    private timer: TimerInterface,
    private domainEventPublisher: DomainEventPublisherInterface,
    private domainEventFactory: DomainEventFactoryInterface,
    private metricsStore: MetricsStoreInterface,
  ) {}

  async execute(dto: SaveNewItemDTO): Promise<Result<Item>> {
    const uuidOrError = Uuid.create(dto.itemHash.props.uuid)
    if (uuidOrError.isFailed()) {
      return Result.fail(`Item uuid is invalid: ${uuidOrError.getError()}`)
    }
    const uuid = uuidOrError.getValue()

    let updatedWithSession = null
    if (dto.sessionUuid) {
      const sessionUuidOrError = Uuid.create(dto.sessionUuid)
      if (sessionUuidOrError.isFailed()) {
        return Result.fail(`Session uuid is invalid: ${sessionUuidOrError.getError()}`)
      }
      updatedWithSession = sessionUuidOrError.getValue()
    }
    const userUuidOrError = Uuid.create(dto.userUuid)
    if (userUuidOrError.isFailed()) {
      return Result.fail(`User uuid is invalid: ${userUuidOrError.getError()}`)
    }
    const userUuid = userUuidOrError.getValue()

    const contentTypeOrError = ContentType.create(dto.itemHash.props.content_type)
    if (contentTypeOrError.isFailed()) {
      return Result.fail(contentTypeOrError.getError())
    }
    const contentType = contentTypeOrError.getValue()

    let duplicateOf = null
    if (dto.itemHash.props.duplicate_of) {
      const duplicateOfOrError = Uuid.create(dto.itemHash.props.duplicate_of)
      if (duplicateOfOrError.isFailed()) {
        return Result.fail(`Duplicate of uuid is invalid: ${duplicateOfOrError.getError()}`)
      }
      duplicateOf = duplicateOfOrError.getValue()
    }

    const now = this.timer.getTimestampInMicroseconds()
    const nowDate = this.timer.convertMicrosecondsToDate(now)

    let createdAtDate = nowDate
    let createdAtTimestamp = now
    if (dto.itemHash.props.created_at_timestamp) {
      createdAtTimestamp = dto.itemHash.props.created_at_timestamp
      createdAtDate = this.timer.convertMicrosecondsToDate(createdAtTimestamp)
    } else if (dto.itemHash.props.created_at) {
      createdAtTimestamp = this.timer.convertStringDateToMicroseconds(dto.itemHash.props.created_at)
      createdAtDate = this.timer.convertStringDateToDate(dto.itemHash.props.created_at)
    }

    const datesOrError = Dates.create(createdAtDate, nowDate)
    if (datesOrError.isFailed()) {
      return Result.fail(datesOrError.getError())
    }
    const dates = datesOrError.getValue()

    const timestampsOrError = Timestamps.create(createdAtTimestamp, now)
    if (timestampsOrError.isFailed()) {
      return Result.fail(timestampsOrError.getError())
    }
    const timestamps = timestampsOrError.getValue()

    const itemOrError = Item.create(
      {
        updatedWithSession,
        content: dto.itemHash.props.content ?? null,
        userUuid,
        contentType,
        encItemKey: dto.itemHash.props.enc_item_key ?? null,
        authHash: dto.itemHash.props.auth_hash ?? null,
        itemsKeyId: dto.itemHash.props.items_key_id ?? null,
        duplicateOf,
        deleted: dto.itemHash.props.deleted ?? false,
        dates,
        timestamps,
      },
      new UniqueEntityId(uuid.value),
    )
    if (itemOrError.isFailed()) {
      return Result.fail(itemOrError.getError())
    }
    const newItem = itemOrError.getValue()
    newItem.props.contentSize = Buffer.byteLength(JSON.stringify(newItem))

    if (dto.itemHash.representsASharedVaultItem()) {
      const sharedVaultAssociationOrError = SharedVaultAssociation.create({
        lastEditedBy: userUuid,
        sharedVaultUuid: dto.itemHash.sharedVaultUuid as Uuid,
      })
      if (sharedVaultAssociationOrError.isFailed()) {
        return Result.fail(sharedVaultAssociationOrError.getError())
      }
      newItem.props.sharedVaultAssociation = sharedVaultAssociationOrError.getValue()
    }

    if (dto.itemHash.hasDedicatedKeySystemAssociation()) {
      const keySystemIdentifiedValidationResult = Validator.isNotEmptyString(dto.itemHash.props.key_system_identifier)
      if (keySystemIdentifiedValidationResult.isFailed()) {
        return Result.fail(keySystemIdentifiedValidationResult.getError())
      }
      const keySystemIdentifier = dto.itemHash.props.key_system_identifier as string

      const keySystemAssociationOrError = KeySystemAssociation.create(keySystemIdentifier)
      if (keySystemAssociationOrError.isFailed()) {
        return Result.fail(keySystemAssociationOrError.getError())
      }
      newItem.props.keySystemAssociation = keySystemAssociationOrError.getValue()
    }

    await this.itemRepository.insert(newItem)

    await this.metricsStore.storeUserBasedMetric(
      Metric.create({
        name: Metric.NAMES.ContentSizeUtilized,
        timestamp: this.timer.getTimestampInMicroseconds(),
      }).getValue(),
      newItem.props.contentSize,
      userUuid.value,
    )

    await this.metricsStore.storeMetric(
      Metric.create({ name: Metric.NAMES.ItemCreated, timestamp: this.timer.getTimestampInMicroseconds() }).getValue(),
    )

    if (contentType.value !== null && [ContentType.TYPES.Note, ContentType.TYPES.File].includes(contentType.value)) {
      await this.domainEventPublisher.publish(
        this.domainEventFactory.createItemRevisionCreationRequested({
          itemUuid: newItem.id.toString(),
          userUuid: newItem.props.userUuid.value,
        }),
      )
    }

    if (duplicateOf) {
      await this.domainEventPublisher.publish(
        this.domainEventFactory.createDuplicateItemSyncedEvent({
          itemUuid: newItem.id.toString(),
          userUuid: newItem.props.userUuid.value,
        }),
      )
    }

    return Result.ok(newItem)
  }
}
