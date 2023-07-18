import {
  ContentType,
  Dates,
  Result,
  Timestamps,
  UniqueEntityId,
  UseCaseInterface,
  Uuid,
} from '@standardnotes/domain-core'
import { TimerInterface } from '@standardnotes/time'
import { DomainEventPublisherInterface } from '@standardnotes/domain-events'

import { Item } from '../../../Item/Item'
import { SaveNewItemDTO } from './SaveNewItemDTO'
import { ItemRepositoryInterface } from '../../../Item/ItemRepositoryInterface'
import { DomainEventFactoryInterface } from '../../../Event/DomainEventFactoryInterface'
import { SharedVaultAssociation } from '../../../SharedVault/SharedVaultAssociation'
import { KeySystemAssociation } from '../../../KeySystem/KeySystemAssociation'

export class SaveNewItem implements UseCaseInterface<Item> {
  constructor(
    private itemRepository: ItemRepositoryInterface,
    private timer: TimerInterface,
    private domainEventPublisher: DomainEventPublisherInterface,
    private domainEventFactory: DomainEventFactoryInterface,
  ) {}

  async execute(dto: SaveNewItemDTO): Promise<Result<Item>> {
    const uuidOrError = Uuid.create(dto.itemHash.props.uuid)
    if (uuidOrError.isFailed()) {
      return Result.fail(uuidOrError.getError())
    }
    const uuid = uuidOrError.getValue()

    let updatedWithSession = null
    if (dto.sessionUuid) {
      const sessionUuidOrError = Uuid.create(dto.sessionUuid)
      if (sessionUuidOrError.isFailed()) {
        return Result.fail(sessionUuidOrError.getError())
      }
      updatedWithSession = sessionUuidOrError.getValue()
    }
    const userUuidOrError = Uuid.create(dto.userUuid)
    if (userUuidOrError.isFailed()) {
      return Result.fail(userUuidOrError.getError())
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
        return Result.fail(duplicateOfOrError.getError())
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

    let sharedVaultAssociation = undefined
    if (dto.itemHash.representsASharedVaultItem()) {
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
        itemUuid: uuid,
      })
      if (sharedVaultAssociationOrError.isFailed()) {
        return Result.fail(sharedVaultAssociationOrError.getError())
      }
      sharedVaultAssociation = sharedVaultAssociationOrError.getValue()
    }

    let keySystemAssociation = undefined
    if (dto.itemHash.hasDedicatedKeySystemAssociation()) {
      const keySystemUuidOrError = Uuid.create(dto.itemHash.props.key_system_identifier as string)
      if (keySystemUuidOrError.isFailed()) {
        return Result.fail(keySystemUuidOrError.getError())
      }
      const keySystemUuid = keySystemUuidOrError.getValue()

      const keySystemAssociationOrError = KeySystemAssociation.create({
        itemUuid: uuid,
        timestamps: Timestamps.create(
          this.timer.getTimestampInMicroseconds(),
          this.timer.getTimestampInMicroseconds(),
        ).getValue(),
        keySystemUuid,
      })
      if (keySystemAssociationOrError.isFailed()) {
        return Result.fail(keySystemAssociationOrError.getError())
      }
      keySystemAssociation = keySystemAssociationOrError.getValue()
    }

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
        keySystemAssociation,
        sharedVaultAssociation,
      },
      new UniqueEntityId(uuid.value),
    )
    if (itemOrError.isFailed()) {
      return Result.fail(itemOrError.getError())
    }
    const newItem = itemOrError.getValue()

    await this.itemRepository.save(newItem)

    if (contentType.value !== null && [ContentType.TYPES.Note, ContentType.TYPES.File].includes(contentType.value)) {
      await this.domainEventPublisher.publish(
        this.domainEventFactory.createItemRevisionCreationRequested(
          newItem.id.toString(),
          newItem.props.userUuid.value,
        ),
      )
    }

    if (duplicateOf) {
      await this.domainEventPublisher.publish(
        this.domainEventFactory.createDuplicateItemSyncedEvent(newItem.id.toString(), newItem.props.userUuid.value),
      )
    }

    return Result.ok(newItem)
  }
}
