import { DomainEventInterface } from './DomainEventInterface'

import { TransitionStatusUpdatedEventPayload } from './TransitionStatusUpdatedEventPayload'

export interface TransitionStatusUpdatedEvent extends DomainEventInterface {
  type: 'TRANSITION_STATUS_UPDATED'
  payload: TransitionStatusUpdatedEventPayload
}
