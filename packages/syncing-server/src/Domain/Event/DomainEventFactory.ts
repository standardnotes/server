/* istanbul ignore file */
import {
  DomainEventService,
  DuplicateItemSyncedEvent,
  EmailArchiveExtensionSyncedEvent,
  EmailBackupAttachmentCreatedEvent,
  EmailRequestedEvent,
  ItemDumpedEvent,
  ItemRevisionCreationRequestedEvent,
  ItemsSyncedEvent,
  OneDriveBackupFailedEvent,
  RevisionsCopyRequestedEvent,
  RevisionsOwnershipUpdateRequestedEvent,
  UserContentSizeRecalculationRequestedEvent,
} from '@standardnotes/domain-events'
import { TimerInterface } from '@standardnotes/time'
import { inject, injectable } from 'inversify'
import TYPES from '../../Bootstrap/Types'
import { DomainEventFactoryInterface } from './DomainEventFactoryInterface'

@injectable()
export class DomainEventFactory implements DomainEventFactoryInterface {
  constructor(@inject(TYPES.Timer) private timer: TimerInterface) {}

  createRevisionsOwnershipUpdateRequestedEvent(dto: {
    userUuid: string
    itemUuid: string
  }): RevisionsOwnershipUpdateRequestedEvent {
    return {
      type: 'REVISIONS_OWNERSHIP_UPDATE_REQUESTED',
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

  createItemDumpedEvent(fileDumpPath: string, userUuid: string): ItemDumpedEvent {
    return {
      type: 'ITEM_DUMPED',
      createdAt: this.timer.getUTCDate(),
      meta: {
        correlation: {
          userIdentifier: userUuid,
          userIdentifierType: 'uuid',
        },
        origin: DomainEventService.SyncingServer,
      },
      payload: {
        fileDumpPath,
      },
    }
  }

  createItemRevisionCreationRequested(itemUuid: string, userUuid: string): ItemRevisionCreationRequestedEvent {
    return {
      type: 'ITEM_REVISION_CREATION_REQUESTED',
      createdAt: this.timer.getUTCDate(),
      meta: {
        correlation: {
          userIdentifier: userUuid,
          userIdentifierType: 'uuid',
        },
        origin: DomainEventService.SyncingServer,
      },
      payload: {
        itemUuid,
      },
    }
  }

  createUserContentSizeRecalculationRequestedEvent(userUuid: string): UserContentSizeRecalculationRequestedEvent {
    return {
      type: 'USER_CONTENT_SIZE_RECALCULATION_REQUESTED',
      createdAt: this.timer.getUTCDate(),
      meta: {
        correlation: {
          userIdentifier: userUuid,
          userIdentifierType: 'uuid',
        },
        origin: DomainEventService.SyncingServer,
      },
      payload: {
        userUuid,
      },
    }
  }

  createDuplicateItemSyncedEvent(itemUuid: string, userUuid: string): DuplicateItemSyncedEvent {
    return {
      type: 'DUPLICATE_ITEM_SYNCED',
      createdAt: this.timer.getUTCDate(),
      meta: {
        correlation: {
          userIdentifier: userUuid,
          userIdentifierType: 'uuid',
        },
        origin: DomainEventService.SyncingServer,
      },
      payload: {
        itemUuid,
        userUuid,
      },
    }
  }

  createEmailRequestedEvent(dto: {
    userEmail: string
    messageIdentifier: string
    level: string
    body: string
    subject: string
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

  createOneDriveBackupFailedEvent(muteCloudEmailsSettingUuid: string, email: string): OneDriveBackupFailedEvent {
    return {
      type: 'ONE_DRIVE_BACKUP_FAILED',
      createdAt: this.timer.getUTCDate(),
      meta: {
        correlation: {
          userIdentifier: email,
          userIdentifierType: 'email',
        },
        origin: DomainEventService.SyncingServer,
      },
      payload: {
        muteCloudEmailsSettingUuid,
        email,
      },
    }
  }

  createItemsSyncedEvent(dto: {
    userUuid: string
    extensionUrl: string
    extensionId: string
    itemUuids: Array<string>
    forceMute: boolean
    skipFileBackup: boolean
    source: 'account-deletion' | 'realtime-extensions-sync'
  }): ItemsSyncedEvent {
    return {
      type: 'ITEMS_SYNCED',
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

  createEmailArchiveExtensionSyncedEvent(userUuid: string, extensionId: string): EmailArchiveExtensionSyncedEvent {
    return {
      type: 'EMAIL_ARCHIVE_EXTENSION_SYNCED',
      createdAt: this.timer.getUTCDate(),
      meta: {
        correlation: {
          userIdentifier: userUuid,
          userIdentifierType: 'uuid',
        },
        origin: DomainEventService.SyncingServer,
      },
      payload: {
        userUuid,
        extensionId,
      },
    }
  }

  createEmailBackupAttachmentCreatedEvent(dto: {
    backupFileName: string
    backupFileIndex: number
    backupFilesTotal: number
    email: string
  }): EmailBackupAttachmentCreatedEvent {
    return {
      type: 'EMAIL_BACKUP_ATTACHMENT_CREATED',
      createdAt: this.timer.getUTCDate(),
      meta: {
        correlation: {
          userIdentifier: dto.email,
          userIdentifierType: 'email',
        },
        origin: DomainEventService.SyncingServer,
      },
      payload: dto,
    }
  }
}
