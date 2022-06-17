import 'reflect-metadata'

import { Repository, SelectQueryBuilder, UpdateQueryBuilder } from 'typeorm'
import { Job } from '../../Domain/Job/Job'

import { MySQLJobRepository } from './MySQLJobRepository'

describe('MySQLJobRepository', () => {
  let ormRepository: Repository<Job>
  let queryBuilder: SelectQueryBuilder<Job>

  const createRepository = () => new MySQLJobRepository(ormRepository)

  beforeEach(() => {
    queryBuilder = {} as jest.Mocked<SelectQueryBuilder<Job>>
    queryBuilder.where = jest.fn().mockReturnThis()
    queryBuilder.getOne = jest.fn()
    queryBuilder.getMany = jest.fn()

    ormRepository = {} as jest.Mocked<Repository<Job>>
    ormRepository.createQueryBuilder = jest.fn().mockImplementation(() => queryBuilder)
    ormRepository.save = jest.fn()
  })

  it('should save', async () => {
    await createRepository().save({} as jest.Mocked<Job>)

    expect(ormRepository.save).toHaveBeenCalled()
  })

  it('should find one by uuid', async () => {
    await createRepository().findOneByUuid('1-2-3')

    expect(queryBuilder.where).toHaveBeenCalledWith('uuid = :uuid', { uuid: '1-2-3' })
    expect(queryBuilder.getOne).toHaveBeenCalled()
  })

  it('should find all pending with overdue scheduled time', async () => {
    await createRepository().findPendingOverdue(12345)

    expect(queryBuilder.where).toHaveBeenCalledWith('job.status = :status AND job.scheduled_at <= :timestamp', {
      status: 'pending',
      timestamp: 12345,
    })
    expect(queryBuilder.getMany).toHaveBeenCalled()
  })

  it('should mark job status as done', async () => {
    const updateQueryBuilder = {} as jest.Mocked<UpdateQueryBuilder<Job>>
    updateQueryBuilder.update = jest.fn().mockReturnThis()
    updateQueryBuilder.set = jest.fn().mockReturnThis()
    updateQueryBuilder.where = jest.fn().mockReturnThis()
    updateQueryBuilder.execute = jest.fn()

    ormRepository.createQueryBuilder = jest.fn().mockImplementation(() => updateQueryBuilder)

    await createRepository().markJobAsDone('1-2-3')

    expect(updateQueryBuilder.update).toHaveBeenCalled()
    expect(updateQueryBuilder.set).toHaveBeenCalledWith({ status: 'done' })
    expect(updateQueryBuilder.where).toHaveBeenCalledWith('uuid = :jobUuid', { jobUuid: '1-2-3' })
    expect(updateQueryBuilder.execute).toHaveBeenCalled()
  })
})
