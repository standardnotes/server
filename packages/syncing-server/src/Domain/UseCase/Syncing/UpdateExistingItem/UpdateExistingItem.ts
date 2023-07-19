import { ContentType, Dates, Result, Timestamps, UseCaseInterface, Uuid, Validator } from '@standardnotes/domain-core'
import { DomainEventPublisherInterface } from '@standardnotes/domain-events'
import { TimerInterface } from '@standardnotes/time'

import { Item } from '../../../Item/Item'
import { UpdateExistingItemDTO } from './UpdateExistingItemDTO'
import { ItemRepositoryInterface } from '../../../Item/ItemRepositoryInterface'
import { DomainEventFactoryInterface } from '../../../Event/DomainEventFactoryInterface'
import { SharedVaultAssociation } from '../../../SharedVault/SharedVaultAssociation'
import { KeySystemAssociation } from '../../../KeySystem/KeySystemAssociation'
import { ItemHash } from '../../../Item/ItemHash'

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

    const userUuidOrError = Uuid.create(dto.performingUserUuid)
    if (userUuidOrError.isFailed()) {
      return Result.fail(userUuidOrError.getError())
    }
    const userUuid = userUuidOrError.getValue()

    if (dto.itemHash.props.content) {
      dto.existingItem.props.content = dto.itemHash.props.content
    }

    if (dto.itemHash.props.content_type) {
      const contentTypeOrError = ContentType.create(dto.itemHash.props.content_type)
      if (contentTypeOrError.isFailed()) {
        return Result.fail(contentTypeOrError.getError())
      }
      const contentType = contentTypeOrError.getValue()
      dto.existingItem.props.contentType = contentType
    }

    if (dto.itemHash.props.deleted !== undefined) {
      dto.existingItem.props.deleted = dto.itemHash.props.deleted
    }

    let wasMarkedAsDuplicate = false
    if (dto.itemHash.props.duplicate_of) {
      const duplicateOfOrError = Uuid.create(dto.itemHash.props.duplicate_of)
      if (duplicateOfOrError.isFailed()) {
        return Result.fail(duplicateOfOrError.getError())
      }
      wasMarkedAsDuplicate = dto.existingItem.props.duplicateOf === null
      dto.existingItem.props.duplicateOf = duplicateOfOrError.getValue()
    }

    if (dto.itemHash.props.auth_hash) {
      dto.existingItem.props.authHash = dto.itemHash.props.auth_hash
    }
    if (dto.itemHash.props.enc_item_key) {
      dto.existingItem.props.encItemKey = dto.itemHash.props.enc_item_key
    }
    if (dto.itemHash.props.items_key_id) {
      dto.existingItem.props.itemsKeyId = dto.itemHash.props.items_key_id
    }

    const updatedAtTimestamp = this.timer.getTimestampInMicroseconds()
    const secondsFromLastUpdate = this.timer.convertMicrosecondsToSeconds(
      updatedAtTimestamp - dto.existingItem.props.timestamps.updatedAt,
    )
    const updatedAtDate = this.timer.convertMicrosecondsToDate(updatedAtTimestamp)

    let createdAtTimestamp: number
    let createdAtDate: Date
    if (dto.itemHash.props.created_at_timestamp) {
      createdAtTimestamp = dto.itemHash.props.created_at_timestamp
      createdAtDate = this.timer.convertMicrosecondsToDate(createdAtTimestamp)
    } else if (dto.itemHash.props.created_at) {
      createdAtTimestamp = this.timer.convertStringDateToMicroseconds(dto.itemHash.props.created_at)
      createdAtDate = this.timer.convertStringDateToDate(dto.itemHash.props.created_at)
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

    if (
      dto.itemHash.representsASharedVaultItem() &&
      !this.itemIsAlreadyAssociatedWithTheSharedVault(dto.existingItem, dto.itemHash)
    ) {
      const sharedVaultUuidOrError = Uuid.create(dto.itemHash.props.shared_vault_uuid as string)
      if (sharedVaultUuidOrError.isFailed()) {
        return Result.fail(sharedVaultUuidOrError.getError())
      }
      const sharedVaultUuid = sharedVaultUuidOrError.getValue()

      const sharedVaultAssociationOrError = SharedVaultAssociation.create({
        lastEditedBy: userUuid,
        sharedVaultUuid,
        timestamps: Timestamps.create(
          this.timer.getTimestampInMicroseconds(),
          this.timer.getTimestampInMicroseconds(),
        ).getValue(),
        itemUuid: Uuid.create(dto.existingItem.id.toString()).getValue(),
      })
      if (sharedVaultAssociationOrError.isFailed()) {
        return Result.fail(sharedVaultAssociationOrError.getError())
      }

      dto.existingItem.props.sharedVaultAssociation = sharedVaultAssociationOrError.getValue()
    }

    if (
      dto.itemHash.hasDedicatedKeySystemAssociation() &&
      !this.itemIsAlreadyAssociatedWithTheKeySystem(dto.existingItem, dto.itemHash)
    ) {
      const keySystemIdentifiedValidationResult = Validator.isNotEmptyString(dto.itemHash.props.key_system_identifier)
      if (keySystemIdentifiedValidationResult.isFailed()) {
        return Result.fail(keySystemIdentifiedValidationResult.getError())
      }
      const keySystemIdentifier = dto.itemHash.props.key_system_identifier as string

      const keySystemAssociationOrError = KeySystemAssociation.create({
        itemUuid: Uuid.create(dto.existingItem.id.toString()).getValue(),
        timestamps: Timestamps.create(
          this.timer.getTimestampInMicroseconds(),
          this.timer.getTimestampInMicroseconds(),
        ).getValue(),
        keySystemIdentifier,
      })
      if (keySystemAssociationOrError.isFailed()) {
        return Result.fail(keySystemAssociationOrError.getError())
      }

      dto.existingItem.props.keySystemAssociation = keySystemAssociationOrError.getValue()
    }

    if (dto.itemHash.props.deleted === true) {
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

  private itemIsAlreadyAssociatedWithTheSharedVault(item: Item, itemHash: ItemHash): boolean {
    return (
      item.props.sharedVaultAssociation !== undefined &&
      item.props.sharedVaultAssociation.props.sharedVaultUuid.value === itemHash.props.shared_vault_uuid
    )
  }

  private itemIsAlreadyAssociatedWithTheKeySystem(item: Item, itemHash: ItemHash): boolean {
    return (
      item.props.keySystemAssociation !== undefined &&
      item.props.keySystemAssociation.props.keySystemIdentifier === itemHash.props.key_system_identifier
    )
  }
}
