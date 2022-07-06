import { DomainEventInterface } from './DomainEventInterface'

import { SharedSubscriptionInvitationCanceledEventPayload } from './SharedSubscriptionInvitationCanceledEventPayload'

export interface SharedSubscriptionInvitationCanceledEvent extends DomainEventInterface {
  type: 'SHARED_SUBSCRIPTION_INVITATION_CANCELED'
  payload: SharedSubscriptionInvitationCanceledEventPayload
}
