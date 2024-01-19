import { DomainEventInterface } from './DomainEventInterface'

import { SubscriptionStateFetchedEventPayload } from './SubscriptionStateFetchedEventPayload'

export interface SubscriptionStateFetchedEvent extends DomainEventInterface {
  type: 'SUBSCRIPTION_STATE_FETCHED'
  payload: SubscriptionStateFetchedEventPayload
}
