import { Uuid } from '@standardnotes/common'
import { Predicate } from '@standardnotes/scheduler'

export type VerifyPredicateDTO = {
  predicate: Predicate
  userUuid: Uuid
}
