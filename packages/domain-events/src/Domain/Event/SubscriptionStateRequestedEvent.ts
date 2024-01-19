import { DomainEventInterface } from './DomainEventInterface'

import { SubscriptionStateRequestedEventPayload } from './SubscriptionStateRequestedEventPayload'

export interface SubscriptionStateRequestedEvent extends DomainEventInterface {
  type: 'SUBSCRIPTION_STATE_REQUESTED'
  payload: SubscriptionStateRequestedEventPayload
}
