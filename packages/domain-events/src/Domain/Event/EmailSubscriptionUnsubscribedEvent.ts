import { DomainEventInterface } from './DomainEventInterface'
import { EmailSubscriptionUnsubscribedEventPayload } from './EmailSubscriptionUnsubscribedEventPayload'

export interface EmailSubscriptionUnsubscribedEvent extends DomainEventInterface {
  type: 'EMAIL_SUBSCRIPTION_UNSUBSCRIBED'
  payload: EmailSubscriptionUnsubscribedEventPayload
}
