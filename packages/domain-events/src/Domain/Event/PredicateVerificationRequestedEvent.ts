import { DomainEventInterface } from './DomainEventInterface'
import { PredicateVerificationRequestedEventPayload } from './PredicateVerificationRequestedEventPayload'

export interface PredicateVerificationRequestedEvent extends DomainEventInterface {
  type: 'PREDICATE_VERIFICATION_REQUESTED'
  payload: PredicateVerificationRequestedEventPayload
}
