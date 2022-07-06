import { Predicate, PredicateVerificationResult } from '@standardnotes/predicates'

export interface PredicateVerifiedEventPayload {
  predicate: Predicate
  predicateVerificationResult: PredicateVerificationResult
}
