import { ContentType, Dates, Result, Timestamps, UseCaseInterface, Uuid } from '@standardnotes/domain-core'
import { DomainEventPublisherInterface } from '@standardnotes/domain-events'
import { TimerInterface } from '@standardnotes/time'

import { Item } from '../../../Item/Item'
import { UpdateExistingItemDTO } from './UpdateExistingItemDTO'
import { ItemRepositoryInterface } from '../../../Item/ItemRepositoryInterface'
import { DomainEventFactoryInterface } from '../../../Event/DomainEventFactoryInterface'

export class UpdateExistingItem implements UseCaseInterface<Item> {
  constructor(
    private itemRepository: ItemRepositoryInterface,
    private timer: TimerInterface,
    private domainEventPublisher: DomainEventPublisherInterface,
    private domainEventFactory: DomainEventFactoryInterface,
    private revisionFrequency: number,
  ) {}

  async execute(dto: UpdateExistingItemDTO): Promise<Result<Item>> {
    let sessionUuid = null
    if (dto.sessionUuid) {
      const sessionUuidOrError = Uuid.create(dto.sessionUuid)
      if (sessionUuidOrError.isFailed()) {
        return Result.fail(sessionUuidOrError.getError())
      }
      sessionUuid = sessionUuidOrError.getValue()
    }
    dto.existingItem.props.updatedWithSession = sessionUuid

    if (dto.itemHash.content) {
      dto.existingItem.props.content = dto.itemHash.content
    }

    if (dto.itemHash.content_type) {
      const contentTypeOrError = ContentType.create(dto.itemHash.content_type)
      if (contentTypeOrError.isFailed()) {
        return Result.fail(contentTypeOrError.getError())
      }
      const contentType = contentTypeOrError.getValue()
      dto.existingItem.props.contentType = contentType
    }

    if (dto.itemHash.deleted !== undefined) {
      dto.existingItem.props.deleted = dto.itemHash.deleted
    }

    let wasMarkedAsDuplicate = false
    if (dto.itemHash.duplicate_of) {
      const duplicateOfOrError = Uuid.create(dto.itemHash.duplicate_of)
      if (duplicateOfOrError.isFailed()) {
        return Result.fail(duplicateOfOrError.getError())
      }
      wasMarkedAsDuplicate = dto.existingItem.props.duplicateOf === null
      dto.existingItem.props.duplicateOf = duplicateOfOrError.getValue()
    }

    if (dto.itemHash.auth_hash) {
      dto.existingItem.props.authHash = dto.itemHash.auth_hash
    }
    if (dto.itemHash.enc_item_key) {
      dto.existingItem.props.encItemKey = dto.itemHash.enc_item_key
    }
    if (dto.itemHash.items_key_id) {
      dto.existingItem.props.itemsKeyId = dto.itemHash.items_key_id
    }

    const updatedAtTimestamp = this.timer.getTimestampInMicroseconds()
    const secondsFromLastUpdate = this.timer.convertMicrosecondsToSeconds(
      updatedAtTimestamp - dto.existingItem.props.timestamps.updatedAt,
    )
    const updatedAtDate = this.timer.convertMicrosecondsToDate(updatedAtTimestamp)

    let createdAtTimestamp: number
    let createdAtDate: Date
    if (dto.itemHash.created_at_timestamp) {
      createdAtTimestamp = dto.itemHash.created_at_timestamp
      createdAtDate = this.timer.convertMicrosecondsToDate(createdAtTimestamp)
    } else if (dto.itemHash.created_at) {
      createdAtTimestamp = this.timer.convertStringDateToMicroseconds(dto.itemHash.created_at)
      createdAtDate = this.timer.convertStringDateToDate(dto.itemHash.created_at)
    } else {
      return Result.fail('Created at timestamp is required.')
    }

    const datesOrError = Dates.create(createdAtDate, updatedAtDate)
    if (datesOrError.isFailed()) {
      return Result.fail(datesOrError.getError())
    }
    dto.existingItem.props.dates = datesOrError.getValue()

    const timestampsOrError = Timestamps.create(createdAtTimestamp, updatedAtTimestamp)
    if (timestampsOrError.isFailed()) {
      return Result.fail(timestampsOrError.getError())
    }
    dto.existingItem.props.timestamps = timestampsOrError.getValue()

    dto.existingItem.props.contentSize = Buffer.byteLength(JSON.stringify(dto.existingItem))

    if (dto.itemHash.deleted === true) {
      dto.existingItem.props.deleted = true
      dto.existingItem.props.content = null
      dto.existingItem.props.contentSize = 0
      dto.existingItem.props.encItemKey = null
      dto.existingItem.props.authHash = null
      dto.existingItem.props.itemsKeyId = null
    }

    await this.itemRepository.save(dto.existingItem)

    if (secondsFromLastUpdate >= this.revisionFrequency) {
      if (
        dto.existingItem.props.contentType.value !== null &&
        [ContentType.TYPES.Note, ContentType.TYPES.File].includes(dto.existingItem.props.contentType.value)
      ) {
        await this.domainEventPublisher.publish(
          this.domainEventFactory.createItemRevisionCreationRequested(
            dto.existingItem.id.toString(),
            dto.existingItem.props.userUuid.value,
          ),
        )
      }
    }

    if (wasMarkedAsDuplicate) {
      await this.domainEventPublisher.publish(
        this.domainEventFactory.createDuplicateItemSyncedEvent(
          dto.existingItem.id.toString(),
          dto.existingItem.props.userUuid.value,
        ),
      )
    }

    return Result.ok(dto.existingItem)
  }
}
