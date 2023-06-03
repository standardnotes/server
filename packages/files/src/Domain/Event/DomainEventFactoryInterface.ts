import {
  UserFileUploadedEvent,
  UserFileRemovedEvent,
  SharedVaultFileUploadedEvent,
  SharedVaultFileRemovedEvent,
} from '@standardnotes/domain-events'

export interface DomainEventFactoryInterface {
  createUserFileUploadedEvent(payload: {
    userUuid: string
    filePath: string
    fileName: string
    fileByteSize: number
  }): UserFileUploadedEvent
  createUserFileRemovedEvent(payload: {
    userUuid: string
    filePath: string
    fileName: string
    fileByteSize: number
    regularSubscriptionUuid: string
  }): UserFileRemovedEvent

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
