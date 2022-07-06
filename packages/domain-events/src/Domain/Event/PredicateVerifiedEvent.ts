import { DomainEventInterface } from './DomainEventInterface'
import { PredicateVerifiedEventPayload } from './PredicateVerifiedEventPayload'

export interface PredicateVerifiedEvent extends DomainEventInterface {
  type: 'PREDICATE_VERIFIED'
  payload: PredicateVerifiedEventPayload
}
