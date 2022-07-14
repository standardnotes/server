import { DomainEventInterface } from './DomainEventInterface'

import { SubscriptionRateAdjustedEventPayload } from './SubscriptionRateAdjustedEventPayload'

export interface SubscriptionRateAdjustedEvent extends DomainEventInterface {
  type: 'SUBSCRIPTION_RATE_ADJUSTED'
  payload: SubscriptionRateAdjustedEventPayload
}
