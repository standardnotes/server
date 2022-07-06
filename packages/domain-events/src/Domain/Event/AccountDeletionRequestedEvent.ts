import { DomainEventInterface } from './DomainEventInterface'
import { AccountDeletionRequestedEventPayload } from './AccountDeletionRequestedEventPayload'

export interface AccountDeletionRequestedEvent extends DomainEventInterface {
  type: 'ACCOUNT_DELETION_REQUESTED'
  payload: AccountDeletionRequestedEventPayload
}
