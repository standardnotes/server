import {
  UserFileUploadedEvent,
  UserFileRemovedEvent,
  VaultFileUploadedEvent,
  VaultFileRemovedEvent,
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

  createVaultFileUploadedEvent(payload: {
    vaultUuid: string
    filePath: string
    fileName: string
    fileByteSize: number
  }): VaultFileUploadedEvent
  createVaultFileRemovedEvent(payload: {
    vaultUuid: string
    filePath: string
    fileName: string
    fileByteSize: number
  }): VaultFileRemovedEvent
}
