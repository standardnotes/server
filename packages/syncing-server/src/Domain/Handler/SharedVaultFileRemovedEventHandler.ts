import { DomainEventHandlerInterface, SharedVaultFileRemovedEvent } from '@standardnotes/domain-events'
import {
  NotificationPayload,
  NotificationPayloadIdentifierType,
  NotificationType,
  Uuid,
} from '@standardnotes/domain-core'
import { Logger } from 'winston'

import { UpdateStorageQuotaUsedInSharedVault } from '../UseCase/SharedVaults/UpdateStorageQuotaUsedInSharedVault/UpdateStorageQuotaUsedInSharedVault'
import { AddNotificationsForUsers } from '../UseCase/Messaging/AddNotificationsForUsers/AddNotificationsForUsers'

export class SharedVaultFileRemovedEventHandler implements DomainEventHandlerInterface {
  constructor(
    private updateStorageQuotaUsedInSharedVaultUseCase: UpdateStorageQuotaUsedInSharedVault,
    private addNotificationsForUsers: AddNotificationsForUsers,
    private logger: Logger,
  ) {}

  async handle(event: SharedVaultFileRemovedEvent): Promise<void> {
    const sharedVaultUuidOrError = Uuid.create(event.payload.sharedVaultUuid)
    if (sharedVaultUuidOrError.isFailed()) {
      this.logger.error(sharedVaultUuidOrError.getError())

      return
    }
    const sharedVaultUuid = sharedVaultUuidOrError.getValue()

    const result = await this.updateStorageQuotaUsedInSharedVaultUseCase.execute({
      sharedVaultUuid: event.payload.sharedVaultUuid,
      bytesUsed: -event.payload.fileByteSize,
    })

    if (result.isFailed()) {
      this.logger.error(`Failed to update storage quota used in shared vault: ${result.getError()}`)

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
      sharedVaultUuid: event.payload.sharedVaultUuid,
      type: NotificationType.TYPES.SharedVaultFileRemoved,
      payload: notificationPayload,
      version: '1.0',
    })
    if (notificationResult.isFailed()) {
      this.logger.error(`Failed to add notification for users: ${notificationResult.getError()}`)
    }
  }
}
