import { DomainEventInterface } from './DomainEventInterface'

import { OfflineSubscriptionTokenCreatedEventPayload } from './OfflineSubscriptionTokenCreatedEventPayload'

export interface OfflineSubscriptionTokenCreatedEvent extends DomainEventInterface {
  type: 'OFFLINE_SUBSCRIPTION_TOKEN_CREATED'
  payload: OfflineSubscriptionTokenCreatedEventPayload
}
