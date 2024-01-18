import { TimerInterface } from '@standardnotes/time'

import { DomainEventFactoryInterface } from './DomainEventFactoryInterface'
import { ContentSizesFixRequestedEvent, DomainEventService } from '@standardnotes/domain-events'

export class DomainEventFactory implements DomainEventFactoryInterface {
  constructor(private timer: TimerInterface) {}

  createContentSizesFixRequestedEvent(dto: { userUuid: string }): ContentSizesFixRequestedEvent {
    return {
      type: 'CONTENT_SIZES_FIX_REQUESTED',
      createdAt: this.timer.getUTCDate(),
      meta: {
        correlation: {
          userIdentifier: dto.userUuid,
          userIdentifierType: 'uuid',
        },
        origin: DomainEventService.Auth,
      },
      payload: dto,
    }
  }
}
