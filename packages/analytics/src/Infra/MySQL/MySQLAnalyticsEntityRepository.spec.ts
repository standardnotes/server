import 'reflect-metadata'

import { Repository, SelectQueryBuilder } from 'typeorm'

import { AnalyticsEntity } from '../../Domain/Entity/AnalyticsEntity'

import { MySQLAnalyticsEntityRepository } from './MySQLAnalyticsEntityRepository'

describe('MySQLAnalyticsEntityRepository', () => {
  let ormRepository: Repository<AnalyticsEntity>
  let analyticsEntity: AnalyticsEntity
  let queryBuilder: SelectQueryBuilder<AnalyticsEntity>

  const createRepository = () => new MySQLAnalyticsEntityRepository(ormRepository)

  beforeEach(() => {
    analyticsEntity = {} as jest.Mocked<AnalyticsEntity>

    queryBuilder = {} as jest.Mocked<SelectQueryBuilder<AnalyticsEntity>>

    ormRepository = {} as jest.Mocked<Repository<AnalyticsEntity>>
    ormRepository.save = jest.fn()
    ormRepository.remove = jest.fn()
    ormRepository.createQueryBuilder = jest.fn().mockImplementation(() => queryBuilder)
  })

  it('should save', async () => {
    await createRepository().save(analyticsEntity)

    expect(ormRepository.save).toHaveBeenCalledWith(analyticsEntity)
  })

  it('should remove', async () => {
    await createRepository().remove(analyticsEntity)

    expect(ormRepository.remove).toHaveBeenCalledWith(analyticsEntity)
  })

  it('should find one by user uuid', async () => {
    queryBuilder.where = jest.fn().mockReturnThis()
    queryBuilder.getOne = jest.fn().mockReturnValue(analyticsEntity)

    const result = await createRepository().findOneByUserUuid('123')

    expect(queryBuilder.where).toHaveBeenCalledWith('analytics_entity.user_uuid = :userUuid', { userUuid: '123' })

    expect(result).toEqual(analyticsEntity)
  })

  it('should find one by user email', async () => {
    queryBuilder.where = jest.fn().mockReturnThis()
    queryBuilder.getOne = jest.fn().mockReturnValue(analyticsEntity)

    const result = await createRepository().findOneByUserEmail('test@test.te')

    expect(queryBuilder.where).toHaveBeenCalledWith('analytics_entity.user_email = :email', { email: 'test@test.te' })

    expect(result).toEqual(analyticsEntity)
  })
})
