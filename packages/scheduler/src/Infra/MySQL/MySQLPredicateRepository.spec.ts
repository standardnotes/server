import 'reflect-metadata'

import { Repository, SelectQueryBuilder } from 'typeorm'
import { Predicate } from '../../Domain/Predicate/Predicate'

import { MySQLPredicateRepository } from './MySQLPredicateRepository'

describe('MySQLPredicateRepository', () => {
  let ormRepository: Repository<Predicate>
  let queryBuilder: SelectQueryBuilder<Predicate>

  const createRepository = () => new MySQLPredicateRepository(ormRepository)

  beforeEach(() => {
    queryBuilder = {} as jest.Mocked<SelectQueryBuilder<Predicate>>
    queryBuilder.where = jest.fn().mockReturnThis()
    queryBuilder.getMany = jest.fn()

    ormRepository = {} as jest.Mocked<Repository<Predicate>>
    ormRepository.createQueryBuilder = jest.fn().mockImplementation(() => queryBuilder)
    ormRepository.save = jest.fn()
  })

  it('should find all by job uuid', async () => {
    await createRepository().findByJobUuid('1-2-3')

    expect(queryBuilder.where).toHaveBeenCalledWith('predicate.job_uuid = :jobUuid', { jobUuid: '1-2-3' })
    expect(queryBuilder.getMany).toHaveBeenCalled()
  })

  it('should save', async () => {
    await createRepository().save({} as jest.Mocked<Predicate>)

    expect(ormRepository.save).toHaveBeenCalled()
  })
})
