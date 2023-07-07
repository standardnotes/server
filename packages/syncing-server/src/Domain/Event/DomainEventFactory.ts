/* istanbul ignore file */
import {
  DomainEventService,
  DuplicateItemSyncedEvent,
  EmailRequestedEvent,
  ItemDumpedEvent,
  ItemRevisionCreationRequestedEvent,
  RevisionsCopyRequestedEvent,
} from '@standardnotes/domain-events'
import { TimerInterface } from '@standardnotes/time'
import { DomainEventFactoryInterface } from './DomainEventFactoryInterface'

export class DomainEventFactory implements DomainEventFactoryInterface {
  constructor(private timer: TimerInterface) {}

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
    sender?: string
    attachments?: Array<{
      filePath: string
      fileName: string
      attachmentFileName: string
      attachmentContentType: string
    }>
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
