import {
  FileUploadedEvent,
  FileRemovedEvent,
  SharedVaultFileRemovedEvent,
  SharedVaultFileUploadedEvent,
  SharedVaultFileMovedEvent,
  FileQuotaRecalculatedEvent,
} from '@standardnotes/domain-events'

export interface DomainEventFactoryInterface {
  createFileQuotaRecalculatedEvent(payload: { userUuid: string; totalFileByteSize: number }): FileQuotaRecalculatedEvent
  createFileUploadedEvent(payload: {
    userUuid: string
    filePath: string
    fileName: string
    fileByteSize: number
  }): FileUploadedEvent
  createFileRemovedEvent(payload: {
    userUuid: string
    filePath: string
    fileName: string
    fileByteSize: number
  }): FileRemovedEvent
  createSharedVaultFileMovedEvent(payload: {
    fileByteSize: number
    fileName: string
    from: {
      sharedVaultUuid?: string
      ownerUuid: string
      filePath: string
    }
    to: {
      sharedVaultUuid?: string
      ownerUuid: string
      filePath: string
    }
  }): SharedVaultFileMovedEvent
  createSharedVaultFileUploadedEvent(payload: {
    sharedVaultUuid: string
    vaultOwnerUuid: string
    filePath: string
    fileName: string
    fileByteSize: number
  }): SharedVaultFileUploadedEvent
  createSharedVaultFileRemovedEvent(payload: {
    sharedVaultUuid: string
    vaultOwnerUuid: string
    filePath: string
    fileName: string
    fileByteSize: number
  }): SharedVaultFileRemovedEvent
}
