import { DomainEventInterface } from './DomainEventInterface'

import { SubscriptionReassignedEventPayload } from './SubscriptionReassignedEventPayload'

export interface SubscriptionReassignedEvent extends DomainEventInterface {
  type: 'SUBSCRIPTION_REASSIGNED'
  payload: SubscriptionReassignedEventPayload
}
