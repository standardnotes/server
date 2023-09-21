import {
  DuplicateItemSyncedEvent,
  EmailRequestedEvent,
  ItemDumpedEvent,
  ItemRemovedFromSharedVaultEvent,
  ItemRevisionCreationRequestedEvent,
  MessageSentToUserEvent,
  NotificationAddedForUserEvent,
  RevisionsCopyRequestedEvent,
  SharedVaultRemovedEvent,
  TransitionStatusUpdatedEvent,
  UserAddedToSharedVaultEvent,
  UserDesignatedAsSurvivorInSharedVaultEvent,
  UserInvitedToSharedVaultEvent,
  UserRemovedFromSharedVaultEvent,
  WebSocketMessageRequestedEvent,
} from '@standardnotes/domain-events'

export interface DomainEventFactoryInterface {
  createWebSocketMessageRequestedEvent(dto: { userUuid: string; message: string }): WebSocketMessageRequestedEvent
  createUserInvitedToSharedVaultEvent(dto: {
    invite: {
      uuid: string
      shared_vault_uuid: string
      user_uuid: string
      sender_uuid: string
      encrypted_message: string
      permission: string
      created_at_timestamp: number
      updated_at_timestamp: number
    }
  }): UserInvitedToSharedVaultEvent
  createMessageSentToUserEvent(dto: {
    message: {
      uuid: string
      recipient_uuid: string
      sender_uuid: string
      encrypted_message: string
      replaceability_identifier: string | null
      created_at_timestamp: number
      updated_at_timestamp: number
    }
  }): MessageSentToUserEvent
  createNotificationAddedForUserEvent(dto: {
    notification: {
      uuid: string
      user_uuid: string
      type: string
      payload: string
      created_at_timestamp: number
      updated_at_timestamp: number
    }
  }): NotificationAddedForUserEvent
  createTransitionStatusUpdatedEvent(dto: {
    userUuid: string
    transitionType: 'items' | 'revisions'
    transitionTimestamp: number
    status: string
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
  createUserAddedToSharedVaultEvent(dto: {
    sharedVaultUuid: string
    userUuid: string
    permission: string
    createdAt: number
    updatedAt: number
  }): UserAddedToSharedVaultEvent
  createUserRemovedFromSharedVaultEvent(dto: {
    sharedVaultUuid: string
    userUuid: string
  }): UserRemovedFromSharedVaultEvent
  createItemRemovedFromSharedVaultEvent(dto: {
    sharedVaultUuid: string
    itemUuid: string
    userUuid: string
  }): ItemRemovedFromSharedVaultEvent
  createSharedVaultRemovedEvent(dto: { sharedVaultUuid: string }): SharedVaultRemovedEvent
  createUserDesignatedAsSurvivorInSharedVaultEvent(dto: {
    sharedVaultUuid: string
    userUuid: string
    timestamp: number
  }): UserDesignatedAsSurvivorInSharedVaultEvent
}
