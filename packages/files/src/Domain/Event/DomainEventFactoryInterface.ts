import {
  FileUploadedEvent,
  FileRemovedEvent,
  SharedVaultFileRemovedEvent,
  SharedVaultFileUploadedEvent,
  SharedVaultFileMovedEvent,
} from '@standardnotes/domain-events'

export interface DomainEventFactoryInterface {
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
