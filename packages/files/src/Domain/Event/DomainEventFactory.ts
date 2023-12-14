import {
  FileUploadedEvent,
  FileRemovedEvent,
  DomainEventService,
  SharedVaultFileUploadedEvent,
  SharedVaultFileRemovedEvent,
  SharedVaultFileMovedEvent,
  FileQuotaRecalculatedEvent,
} from '@standardnotes/domain-events'
import { TimerInterface } from '@standardnotes/time'

import { DomainEventFactoryInterface } from './DomainEventFactoryInterface'

export class DomainEventFactory implements DomainEventFactoryInterface {
  constructor(private timer: TimerInterface) {}

  createFileQuotaRecalculatedEvent(payload: {
    userUuid: string
    totalFileByteSize: number
  }): FileQuotaRecalculatedEvent {
    return {
      type: 'FILE_QUOTA_RECALCULATED',
      createdAt: this.timer.getUTCDate(),
      meta: {
        correlation: {
          userIdentifier: payload.userUuid,
          userIdentifierType: 'uuid',
        },
        origin: DomainEventService.Files,
      },
      payload,
    }
  }

  createFileRemovedEvent(payload: {
    userUuid: string
    filePath: string
    fileName: string
    fileByteSize: number
  }): FileRemovedEvent {
    return {
      type: 'FILE_REMOVED',
      createdAt: this.timer.getUTCDate(),
      meta: {
        correlation: {
          userIdentifier: payload.userUuid,
          userIdentifierType: 'uuid',
        },
        origin: DomainEventService.Files,
      },
      payload,
    }
  }

  createFileUploadedEvent(payload: {
    userUuid: string
    filePath: string
    fileName: string
    fileByteSize: number
  }): FileUploadedEvent {
    return {
      type: 'FILE_UPLOADED',
      createdAt: this.timer.getUTCDate(),
      meta: {
        correlation: {
          userIdentifier: payload.userUuid,
          userIdentifierType: 'uuid',
        },
        origin: DomainEventService.Files,
      },
      payload,
    }
  }

  createSharedVaultFileMovedEvent(payload: {
    fileByteSize: number
    fileName: string
    from: {
      sharedVaultUuid?: string
      ownerUuid: string
      filePath: string
    }
    to: {
      sharedVaultUuid?: string
      ownerUuid: string
      filePath: string
    }
  }): SharedVaultFileMovedEvent {
    return {
      type: 'SHARED_VAULT_FILE_MOVED',
      createdAt: this.timer.getUTCDate(),
      meta: {
        correlation: {
          userIdentifier: payload.from.sharedVaultUuid ?? payload.from.ownerUuid,
          userIdentifierType: payload.from.sharedVaultUuid ? 'shared-vault-uuid' : 'uuid',
        },
        origin: DomainEventService.Files,
      },
      payload,
    }
  }

  createSharedVaultFileUploadedEvent(payload: {
    sharedVaultUuid: string
    vaultOwnerUuid: string
    filePath: string
    fileName: string
    fileByteSize: number
  }): SharedVaultFileUploadedEvent {
    return {
      type: 'SHARED_VAULT_FILE_UPLOADED',
      createdAt: this.timer.getUTCDate(),
      meta: {
        correlation: {
          userIdentifier: payload.sharedVaultUuid,
          userIdentifierType: 'shared-vault-uuid',
        },
        origin: DomainEventService.Files,
      },
      payload,
    }
  }

  createSharedVaultFileRemovedEvent(payload: {
    sharedVaultUuid: string
    vaultOwnerUuid: string
    filePath: string
    fileName: string
    fileByteSize: number
  }): SharedVaultFileRemovedEvent {
    return {
      type: 'SHARED_VAULT_FILE_REMOVED',
      createdAt: this.timer.getUTCDate(),
      meta: {
        correlation: {
          userIdentifier: payload.sharedVaultUuid,
          userIdentifierType: 'shared-vault-uuid',
        },
        origin: DomainEventService.Files,
      },
      payload,
    }
  }
}
