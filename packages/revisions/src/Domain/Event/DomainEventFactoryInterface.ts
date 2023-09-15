import { TransitionStatusUpdatedEvent } from '@standardnotes/domain-events'

export interface DomainEventFactoryInterface {
  createTransitionStatusUpdatedEvent(dto: {
    userUuid: string
    transitionType: 'items' | 'revisions'
    transitionTimestamp: number
    status: 'STARTED' | 'IN_PROGRESS' | 'FAILED' | 'FINISHED' | 'VERIFIED'
  }): TransitionStatusUpdatedEvent
}
