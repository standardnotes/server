import { DomainEventInterface } from './DomainEventInterface'

import { SubscriptionRenewedEventPayload } from './SubscriptionRenewedEventPayload'

export interface SubscriptionRenewedEvent extends DomainEventInterface {
  type: 'SUBSCRIPTION_RENEWED'
  payload: SubscriptionRenewedEventPayload
}
