import { DomainEventInterface } from './DomainEventInterface'

import { SubscriptionCancelledEventPayload } from './SubscriptionCancelledEventPayload'

export interface SubscriptionCancelledEvent extends DomainEventInterface {
  type: 'SUBSCRIPTION_CANCELLED'
  payload: SubscriptionCancelledEventPayload
}
