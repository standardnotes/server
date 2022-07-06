import { Predicate, PredicateVerificationResult } from '@standardnotes/scheduler'

export interface PredicateVerifiedEventPayload {
  predicate: Predicate
  predicateVerificationResult: PredicateVerificationResult
}
