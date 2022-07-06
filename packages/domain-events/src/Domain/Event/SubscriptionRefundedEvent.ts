import { DomainEventInterface } from './DomainEventInterface'

import { SubscriptionRefundedEventPayload } from './SubscriptionRefundedEventPayload'

export interface SubscriptionRefundedEvent extends DomainEventInterface {
  type: 'SUBSCRIPTION_REFUNDED'
  payload: SubscriptionRefundedEventPayload
}
