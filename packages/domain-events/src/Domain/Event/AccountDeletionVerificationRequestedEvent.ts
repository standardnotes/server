import { DomainEventInterface } from './DomainEventInterface'
import { AccountDeletionVerificationRequestedEventPayload } from './AccountDeletionVerificationRequestedEventPayload'

export interface AccountDeletionVerificationRequestedEvent extends DomainEventInterface {
  type: 'ACCOUNT_DELETION_VERIFICATION_REQUESTED'
  payload: AccountDeletionVerificationRequestedEventPayload
}
