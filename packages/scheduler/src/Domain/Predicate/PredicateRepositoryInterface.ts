import { Uuid } from '@standardnotes/common'

import { Predicate } from './Predicate'

export interface PredicateRepositoryInterface {
  findByJobUuid(jobUuid: Uuid): Promise<Predicate[]>
  save(predicate: Predicate): Promise<Predicate>
}
