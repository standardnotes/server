import {
  FileUploadedEvent,
  FileRemovedEvent,
  SharedVaultFileRemovedEvent,
  SharedVaultFileUploadedEvent,
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
    regularSubscriptionUuid: string
  }): FileRemovedEvent
  createSharedVaultFileUploadedEvent(payload: {
    sharedVaultUuid: string
    filePath: string
    fileName: string
    fileByteSize: number
  }): SharedVaultFileUploadedEvent
  createSharedVaultFileRemovedEvent(payload: {
    sharedVaultUuid: string
    filePath: string
    fileName: string
    fileByteSize: number
  }): SharedVaultFileRemovedEvent
}
