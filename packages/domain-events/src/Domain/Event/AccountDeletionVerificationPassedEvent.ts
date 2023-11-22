import { DomainEventInterface } from './DomainEventInterface'
import { AccountDeletionVerificationPassedEventPayload } from './AccountDeletionVerificationPassedEventPayload'

export interface AccountDeletionVerificationPassedEvent extends DomainEventInterface {
  type: 'ACCOUNT_DELETION_VERIFICATION_PASSED'
  payload: AccountDeletionVerificationPassedEventPayload
}
