import { FileUploadedEvent, FileRemovedEvent } from '@standardnotes/domain-events'

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
}
