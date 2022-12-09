import {
  DuplicateItemSyncedEvent,
  EmailArchiveExtensionSyncedEvent,
  EmailRequestedEvent,
  ItemDumpedEvent,
  ItemRevisionCreationRequestedEvent,
  ItemsSyncedEvent,
  RevisionsCopyRequestedEvent,
  RevisionsOwnershipUpdateRequestedEvent,
  UserContentSizeRecalculationRequestedEvent,
} from '@standardnotes/domain-events'

export interface DomainEventFactoryInterface {
  createUserContentSizeRecalculationRequestedEvent(userUuid: string): UserContentSizeRecalculationRequestedEvent
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
  createDuplicateItemSyncedEvent(itemUuid: string, userUuid: string): DuplicateItemSyncedEvent
  createItemRevisionCreationRequested(itemUuid: string, userUuid: string): ItemRevisionCreationRequestedEvent
  createItemDumpedEvent(fileDumpPath: string, userUuid: string): ItemDumpedEvent
  createRevisionsCopyRequestedEvent(
    userUuid: string,
    dto: { originalItemUuid: string; newItemUuid: string },
  ): RevisionsCopyRequestedEvent
  createRevisionsOwnershipUpdateRequestedEvent(dto: {
    userUuid: string
    itemUuid: string
  }): RevisionsOwnershipUpdateRequestedEvent
}
