import { DomainEventInterface } from './DomainEventInterface'

import { SubscriptionPurchasedEventPayload } from './SubscriptionPurchasedEventPayload'

export interface SubscriptionPurchasedEvent extends DomainEventInterface {
  type: 'SUBSCRIPTION_PURCHASED'
  payload: SubscriptionPurchasedEventPayload
}
