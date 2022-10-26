import { DomainEventInterface } from './DomainEventInterface'

import { SubscriptionReactivationDiscountRequestedEventPayload } from './SubscriptionReactivationDiscountRequestedEventPayload'

export interface SubscriptionReactivationDiscountRequestedEvent extends DomainEventInterface {
  type: 'SUBSCRIPTION_REACTIVATION_DISCOUNT_REQUESTED'
  payload: SubscriptionReactivationDiscountRequestedEventPayload
}
