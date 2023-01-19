import { Predicate } from './Predicate'

export interface PredicateRepositoryInterface {
  findByJobUuid(jobUuid: string): Promise<Predicate[]>
  save(predicate: Predicate): Promise<Predicate>
}
