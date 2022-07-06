import { DomainEventInterface } from './DomainEventInterface'

import { SubscriptionExpiredEventPayload } from './SubscriptionExpiredEventPayload'

export interface SubscriptionExpiredEvent extends DomainEventInterface {
  type: 'SUBSCRIPTION_EXPIRED'
  payload: SubscriptionExpiredEventPayload
}
