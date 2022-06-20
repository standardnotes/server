import { inject, injectable } from 'inversify'
import { Repository } from 'typeorm'

import TYPES from '../../Bootstrap/Types'
import { Predicate } from '../../Domain/Predicate/Predicate'
import { PredicateRepositoryInterface } from '../../Domain/Predicate/PredicateRepositoryInterface'

@injectable()
export class MySQLPredicateRepository implements PredicateRepositoryInterface {
  constructor(
    @inject(TYPES.ORMPredicateRepository)
    private ormRepository: Repository<Predicate>,
  ) {}

  async save(predicate: Predicate): Promise<Predicate> {
    return this.ormRepository.save(predicate)
  }

  async findByJobUuid(jobUuid: string): Promise<Predicate[]> {
    return this.ormRepository
      .createQueryBuilder('predicate')
      .where('predicate.job_uuid = :jobUuid', {
        jobUuid,
      })
      .getMany()
  }
}
