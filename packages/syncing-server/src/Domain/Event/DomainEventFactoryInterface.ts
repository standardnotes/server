import {
  AccountDeletionVerificationPassedEvent,
  DuplicateItemSyncedEvent,
  EmailRequestedEvent,
  ItemDeletedEvent,
  ItemDumpedEvent,
  ItemRemovedFromSharedVaultEvent,
  ItemRevisionCreationRequestedEvent,
  ItemsChangedOnServerEvent,
  MessageSentToUserEvent,
  NotificationAddedForUserEvent,
  RevisionsCopyRequestedEvent,
  SharedVaultRemovedEvent,
  UserAddedToSharedVaultEvent,
  UserDesignatedAsSurvivorInSharedVaultEvent,
  UserInvitedToSharedVaultEvent,
  UserRemovedFromSharedVaultEvent,
  WebSocketMessageRequestedEvent,
} from '@standardnotes/domain-events'

export interface DomainEventFactoryInterface {
  createWebSocketMessageRequestedEvent(dto: {
    userUuid: string
    message: string
    originatingSessionUuid?: string
  }): WebSocketMessageRequestedEvent
  createItemsChangedOnServerEvent(dto: {
    userUuid: string
    sessionUuid: string
    timestamp: number
  }): ItemsChangedOnServerEvent
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
    userUuid?: string
  }): EmailRequestedEvent
  createDuplicateItemSyncedEvent(dto: { itemUuid: string; userUuid: string }): DuplicateItemSyncedEvent
  createItemDeletedEvent(dto: { itemUuid: string; userUuid: string }): ItemDeletedEvent
  createItemRevisionCreationRequested(dto: { itemUuid: string; userUuid: string }): ItemRevisionCreationRequestedEvent
  createItemDumpedEvent(dto: { fileDumpPath: string; userUuid: string }): ItemDumpedEvent
  createRevisionsCopyRequestedEvent(
    userUuid: string,
    dto: { originalItemUuid: string; newItemUuid: string },
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
  createSharedVaultRemovedEvent(dto: { sharedVaultUuid: string; vaultOwnerUuid: string }): SharedVaultRemovedEvent
  createUserDesignatedAsSurvivorInSharedVaultEvent(dto: {
    sharedVaultUuid: string
    userUuid: string
    timestamp: number
  }): UserDesignatedAsSurvivorInSharedVaultEvent
  createAccountDeletionVerificationPassedEvent(dto: {
    userUuid: string
    email: string
  }): AccountDeletionVerificationPassedEvent
}
