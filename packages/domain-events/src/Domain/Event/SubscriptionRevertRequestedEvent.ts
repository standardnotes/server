import { DomainEventInterface } from './DomainEventInterface'

import { SubscriptionRevertRequestedEventPayload } from './SubscriptionRevertRequestedEventPayload'

export interface SubscriptionRevertRequestedEvent extends DomainEventInterface {
  type: 'SUBSCRIPTION_REVERT_REQUESTED'
  payload: SubscriptionRevertRequestedEventPayload
}
