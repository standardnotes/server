import {
  DuplicateItemSyncedEvent,
  EmailRequestedEvent,
  ItemDumpedEvent,
  ItemRevisionCreationRequestedEvent,
  RevisionsCopyRequestedEvent,
} from '@standardnotes/domain-events'

export interface DomainEventFactoryInterface {
  createEmailRequestedEvent(dto: {
    userEmail: string
    messageIdentifier: string
    level: string
    body: string
    subject: string
    sender?: string
    attachments?: Array<{
      filePath: string
      fileName: string
      attachmentFileName: string
      attachmentContentType: string
    }>
  }): EmailRequestedEvent
  createDuplicateItemSyncedEvent(itemUuid: string, userUuid: string): DuplicateItemSyncedEvent
  createItemRevisionCreationRequested(itemUuid: string, userUuid: string): ItemRevisionCreationRequestedEvent
  createItemDumpedEvent(fileDumpPath: string, userUuid: string): ItemDumpedEvent
  createRevisionsCopyRequestedEvent(
    userUuid: string,
    dto: { originalItemUuid: string; newItemUuid: string },
  ): RevisionsCopyRequestedEvent
}
