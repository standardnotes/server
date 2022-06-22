import 'reflect-metadata'

import { ReadStream } from 'fs'
import { Repository, SelectQueryBuilder } from 'typeorm'
import { Setting } from '../../Domain/Setting/Setting'

import { MySQLSettingRepository } from './MySQLSettingRepository'
import { EmailBackupFrequency, SettingName } from '@standardnotes/settings'

describe('MySQLSettingRepository', () => {
  let ormRepository: Repository<Setting>
  let queryBuilder: SelectQueryBuilder<Setting>
  let setting: Setting

  const createRepository = () => new MySQLSettingRepository(ormRepository)

  beforeEach(() => {
    queryBuilder = {} as jest.Mocked<SelectQueryBuilder<Setting>>

    setting = {} as jest.Mocked<Setting>

    ormRepository = {} as jest.Mocked<Repository<Setting>>
    ormRepository.createQueryBuilder = jest.fn().mockImplementation(() => queryBuilder)
    ormRepository.save = jest.fn()
  })

  it('should save', async () => {
    await createRepository().save(setting)

    expect(ormRepository.save).toHaveBeenCalledWith(setting)
  })

  it('should stream all settings by name and value', async () => {
    const stream = {} as jest.Mocked<ReadStream>
    queryBuilder.where = jest.fn().mockReturnThis()
    queryBuilder.orderBy = jest.fn().mockReturnThis()
    queryBuilder.stream = jest.fn().mockReturnValue(stream)

    const result = await createRepository().streamAllByNameAndValue(
      SettingName.EmailBackupFrequency,
      EmailBackupFrequency.Daily,
    )

    expect(result).toEqual(stream)
  })

  it('should find one setting by uuid', async () => {
    queryBuilder.where = jest.fn().mockReturnThis()
    queryBuilder.getOne = jest.fn().mockReturnValue(setting)

    const result = await createRepository().findOneByUuid('1-2-3')

    expect(queryBuilder.where).toHaveBeenCalledWith('setting.uuid = :uuid', { uuid: '1-2-3' })
    expect(result).toEqual(setting)
  })

  it('should find one setting by name and user uuid', async () => {
    queryBuilder.where = jest.fn().mockReturnThis()
    queryBuilder.getOne = jest.fn().mockReturnValue(setting)

    const result = await createRepository().findOneByNameAndUserUuid('test', '1-2-3')

    expect(queryBuilder.where).toHaveBeenCalledWith('setting.name = :name AND setting.user_uuid = :user_uuid', {
      name: 'test',
      user_uuid: '1-2-3',
    })
    expect(result).toEqual(setting)
  })

  it('should find one setting by name and uuid', async () => {
    queryBuilder.where = jest.fn().mockReturnThis()
    queryBuilder.getOne = jest.fn().mockReturnValue(setting)

    const result = await createRepository().findOneByUuidAndNames('1-2-3', ['test' as SettingName])

    expect(queryBuilder.where).toHaveBeenCalledWith('setting.uuid = :uuid AND setting.name IN (:...names)', {
      names: ['test'],
      uuid: '1-2-3',
    })
    expect(result).toEqual(setting)
  })

  it('should find last setting by name and user uuid', async () => {
    queryBuilder.where = jest.fn().mockReturnThis()
    queryBuilder.orderBy = jest.fn().mockReturnThis()
    queryBuilder.limit = jest.fn().mockReturnThis()
    queryBuilder.getMany = jest.fn().mockReturnValue([setting])

    const result = await createRepository().findLastByNameAndUserUuid('test', '1-2-3')

    expect(queryBuilder.where).toHaveBeenCalledWith('setting.name = :name AND setting.user_uuid = :user_uuid', {
      name: 'test',
      user_uuid: '1-2-3',
    })
    expect(queryBuilder.orderBy).toHaveBeenCalledWith('updated_at', 'DESC')
    expect(queryBuilder.limit).toHaveBeenCalledWith(1)
    expect(result).toEqual(setting)
  })

  it('should return null if not found last setting by name and user uuid', async () => {
    queryBuilder.where = jest.fn().mockReturnThis()
    queryBuilder.orderBy = jest.fn().mockReturnThis()
    queryBuilder.limit = jest.fn().mockReturnThis()
    queryBuilder.getMany = jest.fn().mockReturnValue([])

    const result = await createRepository().findLastByNameAndUserUuid('test', '1-2-3')

    expect(result).toBeNull()
  })

  it('should find all by user uuid', async () => {
    queryBuilder.where = jest.fn().mockReturnThis()

    const settings = [setting]
    queryBuilder.getMany = jest.fn().mockReturnValue(settings)

    const userUuid = '123'
    const result = await createRepository().findAllByUserUuid(userUuid)

    expect(queryBuilder.where).toHaveBeenCalledWith('setting.user_uuid = :user_uuid', { user_uuid: userUuid })
    expect(result).toEqual(settings)
  })

  it('should delete setting if it does exist', async () => {
    const queryBuilder = {
      delete: () => queryBuilder,
      where: () => queryBuilder,
      execute: () => undefined,
    }

    ormRepository.createQueryBuilder = jest.fn().mockImplementation(() => queryBuilder)

    const result = await createRepository().deleteByUserUuid({
      userUuid: 'userUuid',
      settingName: 'settingName',
    })

    expect(result).toEqual(undefined)
  })
})
