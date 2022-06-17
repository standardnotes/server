import { Predicate, PredicateVerificationResult } from '@standardnotes/scheduler'

export type UpdatePredicateStatusDTO = {
  predicate: Predicate
  predicateVerificationResult: PredicateVerificationResult
}
