import { Predicate, PredicateVerificationResult } from '@standardnotes/predicates'

export type UpdatePredicateStatusDTO = {
  predicate: Predicate
  predicateVerificationResult: PredicateVerificationResult
}
