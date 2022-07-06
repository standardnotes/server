import { Uuid } from '@standardnotes/common'

import { PredicateAuthority } from './PredicateAuthority'
import { PredicateName } from './PredicateName'

export type Predicate = {
  jobUuid: Uuid
  name: PredicateName
  authority: PredicateAuthority
}
