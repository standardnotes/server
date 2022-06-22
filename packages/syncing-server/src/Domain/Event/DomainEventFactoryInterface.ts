import {
  DropboxBackupFailedEvent,
  DuplicateItemSyncedEvent,
  EmailArchiveExtensionSyncedEvent,
  EmailBackupAttachmentCreatedEvent,
  GoogleDriveBackupFailedEvent,
  ItemsSyncedEvent,
  MailBackupAttachmentTooBigEvent,
  OneDriveBackupFailedEvent,
  UserRegisteredEvent,
} from '@standardnotes/domain-events'

export interface DomainEventFactoryInterface {
  createUserRegisteredEvent(userUuid: string, email: string): UserRegisteredEvent
  createDropboxBackupFailedEvent(muteCloudEmailsSettingUuid: string, email: string): DropboxBackupFailedEvent
  createGoogleDriveBackupFailedEvent(muteCloudEmailsSettingUuid: string, email: string): GoogleDriveBackupFailedEvent
  createOneDriveBackupFailedEvent(muteCloudEmailsSettingUuid: string, email: string): OneDriveBackupFailedEvent
  createMailBackupAttachmentTooBigEvent(dto: {
    allowedSize: string
    attachmentSize: string
    muteEmailsSettingUuid: string
    email: string
  }): MailBackupAttachmentTooBigEvent
  createItemsSyncedEvent(dto: {
    userUuid: string
    extensionUrl: string
    extensionId: string
    itemUuids: Array<string>
    forceMute: boolean
    skipFileBackup: boolean
    source: 'account-deletion' | 'realtime-extensions-sync'
  }): ItemsSyncedEvent
  createEmailArchiveExtensionSyncedEvent(userUuid: string, extensionId: string): EmailArchiveExtensionSyncedEvent
  createEmailBackupAttachmentCreatedEvent(dto: {
    backupFileName: string
    backupFileIndex: number
    backupFilesTotal: number
    email: string
  }): EmailBackupAttachmentCreatedEvent
  createDuplicateItemSyncedEvent(itemUuid: string, userUuid: string): DuplicateItemSyncedEvent
}
