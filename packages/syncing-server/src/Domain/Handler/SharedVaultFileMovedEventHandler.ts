import { DomainEventHandlerInterface, SharedVaultFileMovedEvent } from '@standardnotes/domain-events'
import {
  NotificationPayload,
  NotificationPayloadIdentifierType,
  NotificationType,
  Uuid,
} from '@standardnotes/domain-core'
import { Logger } from 'winston'

import { UpdateStorageQuotaUsedInSharedVault } from '../UseCase/SharedVaults/UpdateStorageQuotaUsedInSharedVault/UpdateStorageQuotaUsedInSharedVault'
import { AddNotificationsForUsers } from '../UseCase/Messaging/AddNotificationsForUsers/AddNotificationsForUsers'

export class SharedVaultFileMovedEventHandler implements DomainEventHandlerInterface {
  constructor(
    private updateStorageQuotaUsedInSharedVaultUseCase: UpdateStorageQuotaUsedInSharedVault,
    private addNotificationsForUsers: AddNotificationsForUsers,
    private logger: Logger,
  ) {}

  async handle(event: SharedVaultFileMovedEvent): Promise<void> {
    if (event.payload.from.sharedVaultUuid !== undefined) {
      const sharedVaultUuidOrError = Uuid.create(event.payload.from.sharedVaultUuid)
      if (sharedVaultUuidOrError.isFailed()) {
        this.logger.error(sharedVaultUuidOrError.getError())

        return
      }
      const sharedVaultUuid = sharedVaultUuidOrError.getValue()

      const subtractResult = await this.updateStorageQuotaUsedInSharedVaultUseCase.execute({
        sharedVaultUuid: sharedVaultUuid.value,
        bytesUsed: -event.payload.fileByteSize,
      })

      if (subtractResult.isFailed()) {
        this.logger.error(`Failed to update storage quota used in shared vault: ${subtractResult.getError()}`)

        return
      }

      const notificationPayload = NotificationPayload.create({
        primaryIdentifier: sharedVaultUuid,
        primaryIndentifierType: NotificationPayloadIdentifierType.create(
          NotificationPayloadIdentifierType.TYPES.SharedVaultUuid,
        ).getValue(),
        type: NotificationType.create(NotificationType.TYPES.SharedVaultFileRemoved).getValue(),
        version: '1.0',
      }).getValue()

      const notificationResult = await this.addNotificationsForUsers.execute({
        sharedVaultUuid: sharedVaultUuid.value,
        type: NotificationType.TYPES.SharedVaultFileRemoved,
        payload: notificationPayload,
        version: '1.0',
      })
      if (notificationResult.isFailed()) {
        this.logger.error(`Failed to add notification for users: ${notificationResult.getError()}`)
      }
    }

    if (event.payload.to.sharedVaultUuid !== undefined) {
      const sharedVaultUuidOrError = Uuid.create(event.payload.to.sharedVaultUuid)
      if (sharedVaultUuidOrError.isFailed()) {
        this.logger.error(sharedVaultUuidOrError.getError())

        return
      }
      const sharedVaultUuid = sharedVaultUuidOrError.getValue()

      const addResult = await this.updateStorageQuotaUsedInSharedVaultUseCase.execute({
        sharedVaultUuid: sharedVaultUuid.value,
        bytesUsed: event.payload.fileByteSize,
      })

      if (addResult.isFailed()) {
        this.logger.error(`Failed to update storage quota used in shared vault: ${addResult.getError()}`)

        return
      }

      const notificationPayload = NotificationPayload.create({
        primaryIdentifier: sharedVaultUuid,
        primaryIndentifierType: NotificationPayloadIdentifierType.create(
          NotificationPayloadIdentifierType.TYPES.SharedVaultUuid,
        ).getValue(),
        type: NotificationType.create(NotificationType.TYPES.SharedVaultFileUploaded).getValue(),
        version: '1.0',
      }).getValue()

      const notificationResult = await this.addNotificationsForUsers.execute({
        sharedVaultUuid: sharedVaultUuid.value,
        type: NotificationType.TYPES.SharedVaultFileUploaded,
        payload: notificationPayload,
        version: '1.0',
      })
      if (notificationResult.isFailed()) {
        this.logger.error(`Failed to add notification for users: ${notificationResult.getError()}`)
      }
    }
  }
}
