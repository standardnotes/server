import {
  UserFileRemovedEvent,
  UserFileUploadedEvent,
  DomainEventService,
  GroupFileUploadedEvent,
  GroupFileRemovedEvent,
} from '@standardnotes/domain-events'
import { TimerInterface } from '@standardnotes/time'
import { inject, injectable } from 'inversify'

import TYPES from '../../Bootstrap/Types'
import { DomainEventFactoryInterface } from './DomainEventFactoryInterface'

@injectable()
export class DomainEventFactory implements DomainEventFactoryInterface {
  constructor(@inject(TYPES.Timer) private timer: TimerInterface) {}

  createUserFileRemovedEvent(payload: {
    userUuid: string
    filePath: string
    fileName: string
    fileByteSize: number
    regularSubscriptionUuid: string
  }): UserFileRemovedEvent {
    return {
      type: 'USER_FILE_REMOVED',
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

  createUserFileUploadedEvent(payload: {
    userUuid: string
    filePath: string
    fileName: string
    fileByteSize: number
  }): UserFileUploadedEvent {
    return {
      type: 'USER_FILE_UPLOADED',
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

  createGroupFileUploadedEvent(payload: {
    groupUuid: string
    filePath: string
    fileName: string
    fileByteSize: number
  }): GroupFileUploadedEvent {
    return {
      type: 'GROUP_FILE_UPLOADED',
      createdAt: this.timer.getUTCDate(),
      meta: {
        correlation: {
          userIdentifier: payload.groupUuid,
          userIdentifierType: 'uuid',
        },
        origin: DomainEventService.Files,
      },
      payload,
    }
  }

  createGroupFileRemovedEvent(payload: {
    groupUuid: string
    filePath: string
    fileName: string
    fileByteSize: number
  }): GroupFileRemovedEvent {
    return {
      type: 'GROUP_FILE_REMOVED',
      createdAt: this.timer.getUTCDate(),
      meta: {
        correlation: {
          userIdentifier: payload.groupUuid,
          userIdentifierType: 'uuid',
        },
        origin: DomainEventService.Files,
      },
      payload,
    }
  }
}
