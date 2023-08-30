import {
  DuplicateItemSyncedEvent,
  EmailRequestedEvent,
  ItemDumpedEvent,
  ItemRevisionCreationRequestedEvent,
  NotificationAddedForUserEvent,
  RevisionsCopyRequestedEvent,
  TransitionStatusUpdatedEvent,
  WebSocketMessageRequestedEvent,
} from '@standardnotes/domain-events'

export interface DomainEventFactoryInterface {
  createWebSocketMessageRequestedEvent(dto: { userUuid: string; message: string }): WebSocketMessageRequestedEvent
  createNotificationAddedForUserEvent(dto: {
    uuid: string
    userUuid: string
    type: string
    payload: string
    createdAtTimestamp: number
    updatedAtTimestamp: number
  }): NotificationAddedForUserEvent
  createTransitionStatusUpdatedEvent(dto: {
    userUuid: string
    transitionType: 'items' | 'revisions'
    status: 'STARTED' | 'FAILED' | 'FINISHED'
  }): TransitionStatusUpdatedEvent
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
  createDuplicateItemSyncedEvent(dto: {
    itemUuid: string
    userUuid: string
    roleNames: string[]
  }): DuplicateItemSyncedEvent
  createItemRevisionCreationRequested(dto: {
    itemUuid: string
    userUuid: string
    roleNames: string[]
  }): ItemRevisionCreationRequestedEvent
  createItemDumpedEvent(dto: { fileDumpPath: string; userUuid: string; roleNames: string[] }): ItemDumpedEvent
  createRevisionsCopyRequestedEvent(
    userUuid: string,
    dto: { originalItemUuid: string; newItemUuid: string; roleNames: string[] },
  ): RevisionsCopyRequestedEvent
}
