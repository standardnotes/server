import { TransitionStatusUpdatedEvent } from '@standardnotes/domain-events'

export interface DomainEventFactoryInterface {
  createTransitionStatusUpdatedEvent(dto: {
    userUuid: string
    transitionType: 'items' | 'revisions'
    status: 'STARTED' | 'IN_PROGRESS' | 'FAILED' | 'FINISHED'
  }): TransitionStatusUpdatedEvent
}
