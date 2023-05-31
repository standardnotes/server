import {
  UserFileUploadedEvent,
  UserFileRemovedEvent,
  GroupFileUploadedEvent,
  GroupFileRemovedEvent,
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

  createGroupFileUploadedEvent(payload: {
    groupUuid: string
    filePath: string
    fileName: string
    fileByteSize: number
  }): GroupFileUploadedEvent
  createGroupFileRemovedEvent(payload: {
    groupUuid: string
    filePath: string
    fileName: string
    fileByteSize: number
  }): GroupFileRemovedEvent
}
