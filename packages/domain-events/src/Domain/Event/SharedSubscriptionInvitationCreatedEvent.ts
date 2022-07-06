import { DomainEventInterface } from './DomainEventInterface'

import { SharedSubscriptionInvitationCreatedEventPayload } from './SharedSubscriptionInvitationCreatedEventPayload'

export interface SharedSubscriptionInvitationCreatedEvent extends DomainEventInterface {
  type: 'SHARED_SUBSCRIPTION_INVITATION_CREATED'
  payload: SharedSubscriptionInvitationCreatedEventPayload
}
