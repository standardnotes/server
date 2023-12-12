import {
  ContentType,
  Dates,
  NotificationPayload,
  NotificationPayloadIdentifierType,
  NotificationType,
  Result,
  Timestamps,
  UseCaseInterface,
  Uuid,
  Validator,
} from '@standardnotes/domain-core'
import { DomainEventPublisherInterface } from '@standardnotes/domain-events'
import { TimerInterface } from '@standardnotes/time'

import { Item } from '../../../Item/Item'
import { UpdateExistingItemDTO } from './UpdateExistingItemDTO'
import { DomainEventFactoryInterface } from '../../../Event/DomainEventFactoryInterface'
import { SharedVaultAssociation } from '../../../SharedVault/SharedVaultAssociation'
import { KeySystemAssociation } from '../../../KeySystem/KeySystemAssociation'
import { DetermineSharedVaultOperationOnItem } from '../../SharedVaults/DetermineSharedVaultOperationOnItem/DetermineSharedVaultOperationOnItem'
import { SharedVaultOperationOnItem } from '../../../SharedVault/SharedVaultOperationOnItem'
import { RemoveNotificationsForUser } from '../../Messaging/RemoveNotificationsForUser/RemoveNotificationsForUser'
import { ItemHash } from '../../../Item/ItemHash'
import { AddNotificationsForUsers } from '../../Messaging/AddNotificationsForUsers/AddNotificationsForUsers'
import { ItemRepositoryInterface } from '../../../Item/ItemRepositoryInterface'

export class UpdateExistingItem implements UseCaseInterface<Item> {
  constructor(
    private itemRepository: ItemRepositoryInterface,
    private timer: TimerInterface,
    private domainEventPublisher: DomainEventPublisherInterface,
    private domainEventFactory: DomainEventFactoryInterface,
    private freeRevisionFrequency: number,
    private premiumRevisionFrequency: number,
    private determineSharedVaultOperationOnItem: DetermineSharedVaultOperationOnItem,
    private addNotificationForUsers: AddNotificationsForUsers,
    private removeNotificationsForUser: RemoveNotificationsForUser,
  ) {}

  async execute(dto: UpdateExistingItemDTO): Promise<Result<Item>> {
    const userUuidOrError = Uuid.create(dto.performingUserUuid)
    if (userUuidOrError.isFailed()) {
      return Result.fail(`User uuid is invalid: ${userUuidOrError.getError()}`)
    }
    const userUuid = userUuidOrError.getValue()

    let sharedVaultOperation: SharedVaultOperationOnItem | null = null
    if (dto.itemHash.representsASharedVaultItem() || dto.existingItem.isAssociatedWithASharedVault()) {
      const sharedVaultOperationOrError = await this.determineSharedVaultOperationOnItem.execute({
        existingItem: dto.existingItem,
        itemHash: dto.itemHash,
        userUuid: userUuid.value,
      })
      if (sharedVaultOperationOrError.isFailed()) {
        return Result.fail(sharedVaultOperationOrError.getError())
      }
      sharedVaultOperation = sharedVaultOperationOrError.getValue()
    }

    let sessionUuid = null
    if (dto.sessionUuid) {
      const sessionUuidOrError = Uuid.create(dto.sessionUuid)
      if (sessionUuidOrError.isFailed()) {
        return Result.fail(`Session uuid is invalid: ${sessionUuidOrError.getError()}`)
      }
      sessionUuid = sessionUuidOrError.getValue()
    }
    dto.existingItem.props.updatedWithSession = sessionUuid

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
        return Result.fail(`Duplicate of uuid is invalid: ${duplicateOfOrError.getError()}`)
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

    const { createdAtDate, createdAtTimestamp } = this.determineCreatedAt(dto.itemHash)

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

    if (dto.itemHash.representsASharedVaultItem()) {
      const sharedVaultAssociationOrError = SharedVaultAssociation.create({
        lastEditedBy: userUuid,
        sharedVaultUuid: dto.itemHash.sharedVaultUuid as Uuid,
      })

      if (sharedVaultAssociationOrError.isFailed()) {
        return Result.fail(sharedVaultAssociationOrError.getError())
      }

      dto.existingItem.props.sharedVaultAssociation = sharedVaultAssociationOrError.getValue()
    } else {
      dto.existingItem.props.sharedVaultAssociation = undefined
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

      dto.existingItem.props.keySystemAssociation = keySystemAssociationOrError.getValue()
    } else {
      dto.existingItem.props.keySystemAssociation = undefined
    }

    if (dto.itemHash.props.deleted === true) {
      dto.existingItem.props.deleted = true
      dto.existingItem.props.content = null
      dto.existingItem.props.contentSize = 0
      dto.existingItem.props.encItemKey = null
      dto.existingItem.props.authHash = null
      dto.existingItem.props.itemsKeyId = null
    }

    await this.itemRepository.update(dto.existingItem)

    /* istanbul ignore next */
    const revisionsFrequency = dto.isFreeUser ? this.freeRevisionFrequency : this.premiumRevisionFrequency

    if (secondsFromLastUpdate >= revisionsFrequency) {
      if (
        dto.existingItem.props.contentType.value !== null &&
        [ContentType.TYPES.Note, ContentType.TYPES.File].includes(dto.existingItem.props.contentType.value)
      ) {
        await this.domainEventPublisher.publish(
          this.domainEventFactory.createItemRevisionCreationRequested({
            itemUuid: dto.existingItem.id.toString(),
            userUuid: dto.existingItem.props.userUuid.value,
          }),
        )
      }
    }

    if (wasMarkedAsDuplicate) {
      await this.domainEventPublisher.publish(
        this.domainEventFactory.createDuplicateItemSyncedEvent({
          itemUuid: dto.existingItem.id.toString(),
          userUuid: dto.existingItem.props.userUuid.value,
        }),
      )
    }

    const notificationsResult = await this.addNotificationsAndPublishEvents(userUuid, sharedVaultOperation, dto)
    if (notificationsResult.isFailed()) {
      return Result.fail(notificationsResult.getError())
    }

    return Result.ok(dto.existingItem)
  }

  private determineCreatedAt(itemHash: ItemHash): { createdAtDate: Date; createdAtTimestamp: number } {
    let createdAtTimestamp: number
    let createdAtDate: Date
    if (itemHash.props.created_at_timestamp) {
      createdAtTimestamp = itemHash.props.created_at_timestamp
      createdAtDate = this.timer.convertMicrosecondsToDate(createdAtTimestamp)
    } else if (itemHash.props.created_at) {
      createdAtTimestamp = this.timer.convertStringDateToMicroseconds(itemHash.props.created_at)
      createdAtDate = this.timer.convertStringDateToDate(itemHash.props.created_at)
    } else if (itemHash.props.updated_at_timestamp) {
      createdAtTimestamp = itemHash.props.updated_at_timestamp
      createdAtDate = this.timer.convertMicrosecondsToDate(itemHash.props.updated_at_timestamp)
    } else if (itemHash.props.updated_at) {
      createdAtTimestamp = this.timer.convertStringDateToMicroseconds(itemHash.props.updated_at)
      createdAtDate = this.timer.convertStringDateToDate(itemHash.props.updated_at)
    } else {
      createdAtTimestamp = 0
      createdAtDate = new Date(0)
    }

    return { createdAtDate, createdAtTimestamp }
  }

  private async addNotificationsAndPublishEvents(
    userUuid: Uuid,
    sharedVaultOperation: SharedVaultOperationOnItem | null,
    dto: UpdateExistingItemDTO,
  ): Promise<Result<void>> {
    if (
      sharedVaultOperation &&
      sharedVaultOperation.props.type === SharedVaultOperationOnItem.TYPES.RemoveFromSharedVault
    ) {
      const notificationPayloadOrError = NotificationPayload.create({
        primaryIdentifier: sharedVaultOperation.props.sharedVaultUuid,
        primaryIndentifierType: NotificationPayloadIdentifierType.create(
          NotificationPayloadIdentifierType.TYPES.SharedVaultUuid,
        ).getValue(),
        type: NotificationType.create(NotificationType.TYPES.SharedVaultItemRemoved).getValue(),
        secondaryIdentifier: dto.existingItem.uuid,
        secondaryIdentifierType: NotificationPayloadIdentifierType.create(
          NotificationPayloadIdentifierType.TYPES.ItemUuid,
        ).getValue(),
        version: '1.0',
      })
      if (notificationPayloadOrError.isFailed()) {
        return Result.fail(notificationPayloadOrError.getError())
      }
      const payload = notificationPayloadOrError.getValue()

      const result = await this.addNotificationForUsers.execute({
        payload,
        type: NotificationType.TYPES.SharedVaultItemRemoved,
        sharedVaultUuid: sharedVaultOperation.props.sharedVaultUuid.value,
        version: '1.0',
      })
      if (result.isFailed()) {
        return Result.fail(result.getError())
      }

      await this.domainEventPublisher.publish(
        this.domainEventFactory.createItemRemovedFromSharedVaultEvent({
          sharedVaultUuid: sharedVaultOperation.props.sharedVaultUuid.value,
          itemUuid: dto.existingItem.uuid.value,
          userUuid: userUuid.value,
        }),
      )
    }

    if (sharedVaultOperation && sharedVaultOperation.props.type === SharedVaultOperationOnItem.TYPES.AddToSharedVault) {
      const result = await this.removeNotificationsForUser.execute({
        type: NotificationType.TYPES.SharedVaultItemRemoved,
        userUuid: userUuid.value,
      })
      if (result.isFailed()) {
        return Result.fail(result.getError())
      }
    }

    return Result.ok()
  }
}
