import { DomainEventInterface } from './DomainEventInterface'
import { AccountClaimRequestedEventPayload } from './AccountClaimRequestedEventPayload'

export interface AccountClaimRequestedEvent extends DomainEventInterface {
  type: 'ACCOUNT_CLAIM_REQUESTED'
  payload: AccountClaimRequestedEventPayload
}
