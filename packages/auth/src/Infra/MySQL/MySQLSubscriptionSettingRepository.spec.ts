import 'reflect-metadata'

import { Repository, SelectQueryBuilder } from 'typeorm'
import { SubscriptionSetting } from '../../Domain/Setting/SubscriptionSetting'

import { MySQLSubscriptionSettingRepository } from './MySQLSubscriptionSettingRepository'

describe('MySQLSubscriptionSettingRepository', () => {
  let ormRepository: Repository<SubscriptionSetting>
  let queryBuilder: SelectQueryBuilder<SubscriptionSetting>
  let setting: SubscriptionSetting

  const createRepository = () => new MySQLSubscriptionSettingRepository(ormRepository)

  beforeEach(() => {
    queryBuilder = {} as jest.Mocked<SelectQueryBuilder<SubscriptionSetting>>

    setting = {} as jest.Mocked<SubscriptionSetting>

    ormRepository = {} as jest.Mocked<Repository<SubscriptionSetting>>
    ormRepository.createQueryBuilder = jest.fn().mockImplementation(() => queryBuilder)
    ormRepository.save = jest.fn()
  })

  it('should save', async () => {
    await createRepository().save(setting)

    expect(ormRepository.save).toHaveBeenCalledWith(setting)
  })

  it('should find one setting by uuid', async () => {
    queryBuilder.where = jest.fn().mockReturnThis()
    queryBuilder.getOne = jest.fn().mockReturnValue(setting)

    const result = await createRepository().findOneByUuid('1-2-3')

    expect(queryBuilder.where).toHaveBeenCalledWith('setting.uuid = :uuid', { uuid: '1-2-3' })
    expect(result).toEqual(setting)
  })

  it('should find last setting by name and user uuid', async () => {
    queryBuilder.where = jest.fn().mockReturnThis()
    queryBuilder.orderBy = jest.fn().mockReturnThis()
    queryBuilder.limit = jest.fn().mockReturnThis()
    queryBuilder.getMany = jest.fn().mockReturnValue([setting])

    const result = await createRepository().findLastByNameAndUserSubscriptionUuid('test', '1-2-3')

    expect(queryBuilder.where).toHaveBeenCalledWith(
      'setting.name = :name AND setting.user_subscription_uuid = :userSubscriptionUuid',
      { name: 'test', userSubscriptionUuid: '1-2-3' },
    )
    expect(queryBuilder.orderBy).toHaveBeenCalledWith('updated_at', 'DESC')
    expect(queryBuilder.limit).toHaveBeenCalledWith(1)
    expect(result).toEqual(setting)
  })

  it('should return null if not found last setting by name and user uuid', async () => {
    queryBuilder.where = jest.fn().mockReturnThis()
    queryBuilder.orderBy = jest.fn().mockReturnThis()
    queryBuilder.limit = jest.fn().mockReturnThis()
    queryBuilder.getMany = jest.fn().mockReturnValue([])

    const result = await createRepository().findLastByNameAndUserSubscriptionUuid('test', '1-2-3')

    expect(result).toBeNull()
  })
})
