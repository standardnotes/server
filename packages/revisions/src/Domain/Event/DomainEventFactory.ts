/* istanbul ignore file */
import { DomainEventService, TransitionStatusUpdatedEvent } from '@standardnotes/domain-events'
import { TimerInterface } from '@standardnotes/time'
import { DomainEventFactoryInterface } from './DomainEventFactoryInterface'

export class DomainEventFactory implements DomainEventFactoryInterface {
  constructor(private timer: TimerInterface) {}

  createTransitionStatusUpdatedEvent(dto: {
    userUuid: string
    transitionType: 'items' | 'revisions'
    status: 'STARTED' | 'FAILED' | 'FINISHED'
  }): TransitionStatusUpdatedEvent {
    return {
      type: 'TRANSITION_STATUS_UPDATED',
      createdAt: this.timer.getUTCDate(),
      meta: {
        correlation: {
          userIdentifier: dto.userUuid,
          userIdentifierType: 'uuid',
        },
        origin: DomainEventService.SyncingServer,
      },
      payload: {
        transitionTimestamp: this.timer.getTimestampInMicroseconds(),
        ...dto,
      },
    }
  }
}
