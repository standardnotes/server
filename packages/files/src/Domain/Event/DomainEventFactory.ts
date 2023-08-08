import {
  FileUploadedEvent,
  FileRemovedEvent,
  DomainEventService,
  SharedVaultFileUploadedEvent,
  SharedVaultFileRemovedEvent,
} from '@standardnotes/domain-events'
import { TimerInterface } from '@standardnotes/time'
import { inject, injectable } from 'inversify'

import TYPES from '../../Bootstrap/Types'
import { DomainEventFactoryInterface } from './DomainEventFactoryInterface'

@injectable()
export class DomainEventFactory implements DomainEventFactoryInterface {
  constructor(@inject(TYPES.Files_Timer) private timer: TimerInterface) {}

  createFileRemovedEvent(payload: {
    userUuid: string
    filePath: string
    fileName: string
    fileByteSize: number
    regularSubscriptionUuid: string
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
