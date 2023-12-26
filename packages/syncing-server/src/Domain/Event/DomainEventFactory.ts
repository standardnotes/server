/* istanbul ignore file */
import {
  AccountDeletionVerificationPassedEvent,
  DomainEventService,
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
import { TimerInterface } from '@standardnotes/time'
import { DomainEventFactoryInterface } from './DomainEventFactoryInterface'

export class DomainEventFactory implements DomainEventFactoryInterface {
  constructor(private timer: TimerInterface) {}

  createItemsChangedOnServerEvent(dto: {
    userUuid: string
    sessionUuid: string
    timestamp: number
  }): ItemsChangedOnServerEvent {
    return {
      type: 'ITEMS_CHANGED_ON_SERVER',
      createdAt: this.timer.getUTCDate(),
      meta: {
        correlation: {
          userIdentifier: dto.userUuid,
          userIdentifierType: 'uuid',
        },
        origin: DomainEventService.SyncingServer,
      },
      payload: dto,
    }
  }

  createAccountDeletionVerificationPassedEvent(dto: {
    userUuid: string
    email: string
  }): AccountDeletionVerificationPassedEvent {
    return {
      type: 'ACCOUNT_DELETION_VERIFICATION_PASSED',
      createdAt: this.timer.getUTCDate(),
      meta: {
        correlation: {
          userIdentifier: dto.userUuid,
          userIdentifierType: 'uuid',
        },
        origin: DomainEventService.SyncingServer,
      },
      payload: dto,
    }
  }

  createUserDesignatedAsSurvivorInSharedVaultEvent(dto: {
    sharedVaultUuid: string
    userUuid: string
    timestamp: number
  }): UserDesignatedAsSurvivorInSharedVaultEvent {
    return {
      type: 'USER_DESIGNATED_AS_SURVIVOR_IN_SHARED_VAULT',
      createdAt: this.timer.getUTCDate(),
      meta: {
        correlation: {
          userIdentifier: dto.userUuid,
          userIdentifierType: 'uuid',
        },
        origin: DomainEventService.SyncingServer,
      },
      payload: dto,
    }
  }

  createSharedVaultRemovedEvent(dto: { sharedVaultUuid: string; vaultOwnerUuid: string }): SharedVaultRemovedEvent {
    return {
      type: 'SHARED_VAULT_REMOVED',
      createdAt: this.timer.getUTCDate(),
      meta: {
        correlation: {
          userIdentifier: dto.sharedVaultUuid,
          userIdentifierType: 'shared-vault-uuid',
        },
        origin: DomainEventService.SyncingServer,
      },
      payload: dto,
    }
  }

  createItemRemovedFromSharedVaultEvent(dto: {
    sharedVaultUuid: string
    itemUuid: string
    userUuid: string
  }): ItemRemovedFromSharedVaultEvent {
    return {
      type: 'ITEM_REMOVED_FROM_SHARED_VAULT',
      createdAt: this.timer.getUTCDate(),
      meta: {
        correlation: {
          userIdentifier: dto.userUuid,
          userIdentifierType: 'uuid',
        },
        origin: DomainEventService.SyncingServer,
      },
      payload: dto,
    }
  }

  createUserRemovedFromSharedVaultEvent(dto: {
    sharedVaultUuid: string
    userUuid: string
  }): UserRemovedFromSharedVaultEvent {
    return {
      type: 'USER_REMOVED_FROM_SHARED_VAULT',
      createdAt: this.timer.getUTCDate(),
      meta: {
        correlation: {
          userIdentifier: dto.userUuid,
          userIdentifierType: 'uuid',
        },
        origin: DomainEventService.SyncingServer,
      },
      payload: dto,
    }
  }
  createUserAddedToSharedVaultEvent(dto: {
    sharedVaultUuid: string
    userUuid: string
    permission: string
    createdAt: number
    updatedAt: number
  }): UserAddedToSharedVaultEvent {
    return {
      type: 'USER_ADDED_TO_SHARED_VAULT',
      createdAt: this.timer.getUTCDate(),
      meta: {
        correlation: {
          userIdentifier: dto.userUuid,
          userIdentifierType: 'uuid',
        },
        origin: DomainEventService.SyncingServer,
      },
      payload: dto,
    }
  }

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
  }): UserInvitedToSharedVaultEvent {
    return {
      type: 'USER_INVITED_TO_SHARED_VAULT',
      createdAt: this.timer.getUTCDate(),
      meta: {
        correlation: {
          userIdentifier: dto.invite.user_uuid,
          userIdentifierType: 'uuid',
        },
        origin: DomainEventService.SyncingServer,
      },
      payload: dto,
    }
  }

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
  }): MessageSentToUserEvent {
    return {
      type: 'MESSAGE_SENT_TO_USER',
      createdAt: this.timer.getUTCDate(),
      meta: {
        correlation: {
          userIdentifier: dto.message.recipient_uuid,
          userIdentifierType: 'uuid',
        },
        origin: DomainEventService.SyncingServer,
      },
      payload: dto,
    }
  }

  createNotificationAddedForUserEvent(dto: {
    notification: {
      uuid: string
      user_uuid: string
      type: string
      payload: string
      created_at_timestamp: number
      updated_at_timestamp: number
    }
  }): NotificationAddedForUserEvent {
    return {
      type: 'NOTIFICATION_ADDED_FOR_USER',
      createdAt: this.timer.getUTCDate(),
      meta: {
        correlation: {
          userIdentifier: dto.notification.user_uuid,
          userIdentifierType: 'uuid',
        },
        origin: DomainEventService.SyncingServer,
      },
      payload: dto,
    }
  }

  createWebSocketMessageRequestedEvent(dto: {
    userUuid: string
    message: string
    originatingSessionUuid?: string
  }): WebSocketMessageRequestedEvent {
    return {
      type: 'WEB_SOCKET_MESSAGE_REQUESTED',
      createdAt: this.timer.getUTCDate(),
      meta: {
        correlation: {
          userIdentifier: dto.userUuid,
          userIdentifierType: 'uuid',
        },
        origin: DomainEventService.SyncingServer,
      },
      payload: dto,
    }
  }

  createRevisionsCopyRequestedEvent(
    userUuid: string,
    dto: {
      originalItemUuid: string
      newItemUuid: string
    },
  ): RevisionsCopyRequestedEvent {
    return {
      type: 'REVISIONS_COPY_REQUESTED',
      createdAt: this.timer.getUTCDate(),
      meta: {
        correlation: {
          userIdentifier: userUuid,
          userIdentifierType: 'uuid',
        },
        origin: DomainEventService.SyncingServer,
      },
      payload: dto,
    }
  }

  createItemDumpedEvent(dto: { fileDumpPath: string; userUuid: string }): ItemDumpedEvent {
    return {
      type: 'ITEM_DUMPED',
      createdAt: this.timer.getUTCDate(),
      meta: {
        correlation: {
          userIdentifier: dto.userUuid,
          userIdentifierType: 'uuid',
        },
        origin: DomainEventService.SyncingServer,
      },
      payload: {
        fileDumpPath: dto.fileDumpPath,
      },
    }
  }

  createItemRevisionCreationRequested(dto: { itemUuid: string; userUuid: string }): ItemRevisionCreationRequestedEvent {
    return {
      type: 'ITEM_REVISION_CREATION_REQUESTED',
      createdAt: this.timer.getUTCDate(),
      meta: {
        correlation: {
          userIdentifier: dto.userUuid,
          userIdentifierType: 'uuid',
        },
        origin: DomainEventService.SyncingServer,
      },
      payload: {
        itemUuid: dto.itemUuid,
      },
    }
  }

  createDuplicateItemSyncedEvent(dto: { itemUuid: string; userUuid: string }): DuplicateItemSyncedEvent {
    return {
      type: 'DUPLICATE_ITEM_SYNCED',
      createdAt: this.timer.getUTCDate(),
      meta: {
        correlation: {
          userIdentifier: dto.userUuid,
          userIdentifierType: 'uuid',
        },
        origin: DomainEventService.SyncingServer,
      },
      payload: dto,
    }
  }

  createItemDeletedEvent(dto: { itemUuid: string; userUuid: string }): ItemDeletedEvent {
    return {
      type: 'ITEM_DELETED',
      createdAt: this.timer.getUTCDate(),
      meta: {
        correlation: {
          userIdentifier: dto.userUuid,
          userIdentifierType: 'uuid',
        },
        origin: DomainEventService.SyncingServer,
      },
      payload: dto,
    }
  }

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
  }): EmailRequestedEvent {
    return {
      type: 'EMAIL_REQUESTED',
      createdAt: this.timer.getUTCDate(),
      meta: {
        correlation: {
          userIdentifier: dto.userEmail,
          userIdentifierType: 'email',
        },
        origin: DomainEventService.SyncingServer,
      },
      payload: dto,
    }
  }
}
