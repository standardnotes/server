import { DomainEventInterface } from './DomainEventInterface'

import { SubscriptionReactivatedEventPayload } from './SubscriptionReactivatedEventPayload'

export interface SubscriptionReactivatedEvent extends DomainEventInterface {
  type: 'SUBSCRIPTION_REACTIVATED'
  payload: SubscriptionReactivatedEventPayload
}
