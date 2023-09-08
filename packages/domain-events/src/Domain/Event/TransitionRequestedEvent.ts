import { DomainEventInterface } from './DomainEventInterface'

import { TransitionRequestedEventPayload } from './TransitionRequestedEventPayload'

export interface TransitionRequestedEvent extends DomainEventInterface {
  type: 'TRANSITION_REQUESTED'
  payload: TransitionRequestedEventPayload
}
