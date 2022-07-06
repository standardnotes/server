import { Uuid } from '@standardnotes/common'
import { Predicate } from '@standardnotes/predicates'

export type VerifyPredicateDTO = {
  predicate: Predicate
  userUuid: Uuid
}
