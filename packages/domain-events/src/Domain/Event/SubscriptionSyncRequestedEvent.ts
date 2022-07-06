import { DomainEventInterface } from './DomainEventInterface'

import { SubscriptionSyncRequestedEventPayload } from './SubscriptionSyncRequestedEventPayload'

export interface SubscriptionSyncRequestedEvent extends DomainEventInterface {
  type: 'SUBSCRIPTION_SYNC_REQUESTED'
  payload: SubscriptionSyncRequestedEventPayload
}
