import { TransitionStatusUpdatedEvent } from '@standardnotes/domain-events'

export interface DomainEventFactoryInterface {
  createTransitionStatusUpdatedEvent(dto: {
    userUuid: string
    transitionType: 'items' | 'revisions'
    status: 'STARTED' | 'FAILED' | 'FINISHED'
  }): TransitionStatusUpdatedEvent
}
