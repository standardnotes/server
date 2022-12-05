import { DomainEventInterface } from './DomainEventInterface'

import { EmailSubscriptionSyncRequestedEventPayload } from './EmailSubscriptionSyncRequestedEventPayload'

export interface EmailSubscriptionSyncRequestedEvent extends DomainEventInterface {
  type: 'EMAIL_SUBSCRIPTION_SYNC_REQUESTED'
  payload: EmailSubscriptionSyncRequestedEventPayload
}
