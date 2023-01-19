import { PredicateAuthority } from './PredicateAuthority'
import { PredicateName } from './PredicateName'

export type Predicate = {
  jobUuid: string
  name: PredicateName
  authority: PredicateAuthority
}
