import 'reflect-metadata'

import { TimerInterface } from '@standardnotes/time'

import { Setting } from '../../Setting/Setting'
import { SettingRepositoryInterface } from '../../Setting/SettingRepositoryInterface'

import { DeleteSetting } from './DeleteSetting'
import { SettingName, Timestamps, Uuid } from '@standardnotes/domain-core'

describe('DeleteSetting', () => {
  let setting: Setting
  let settingRepository: SettingRepositoryInterface
  let timer: TimerInterface

  const createUseCase = () => new DeleteSetting(settingRepository, timer)

  beforeEach(() => {
    setting = Setting.create({
      name: SettingName.NAMES.LogSessionUserAgent,
      value: 'test',
      serverEncryptionVersion: 0,
      userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      sensitive: false,
      timestamps: Timestamps.create(123, 123).getValue(),
    }).getValue()

    settingRepository = {} as jest.Mocked<SettingRepositoryInterface>
    settingRepository.findLastByNameAndUserUuid = jest.fn().mockReturnValue(setting)
    settingRepository.findOneByUuid = jest.fn().mockReturnValue(setting)
    settingRepository.deleteByUserUuid = jest.fn()
    settingRepository.update = jest.fn()

    timer = {} as jest.Mocked<TimerInterface>
    timer.getTimestampInMicroseconds = jest.fn().mockReturnValue(1)
  })

  it('should delete a setting by name and user uuid', async () => {
    await createUseCase().execute({
      settingName: 'test',
      userUuid: '1-2-3',
    })

    expect(settingRepository.deleteByUserUuid).toHaveBeenCalledWith({ settingName: 'test', userUuid: '1-2-3' })
  })

  it('should delete a setting by uuid', async () => {
    await createUseCase().execute({
      settingName: 'test',
      userUuid: '1-2-3',
      uuid: '3-4-5',
    })

    expect(settingRepository.deleteByUserUuid).toHaveBeenCalledWith({ settingName: 'test', userUuid: '1-2-3' })
  })

  it('should not delete a setting by name and user uuid if not found', async () => {
    settingRepository.findLastByNameAndUserUuid = jest.fn().mockReturnValue(null)

    await createUseCase().execute({
      settingName: 'test',
      userUuid: '1-2-3',
    })

    expect(settingRepository.deleteByUserUuid).not.toHaveBeenCalled()
  })

  it('should not delete a setting by uuid if not found', async () => {
    settingRepository.findOneByUuid = jest.fn().mockReturnValue(null)

    await createUseCase().execute({
      settingName: 'test',
      userUuid: '1-2-3',
      uuid: '2-3-4',
    })

    expect(settingRepository.deleteByUserUuid).not.toHaveBeenCalled()
  })

  it('should soft delete a setting by name and user uuid', async () => {
    await createUseCase().execute({
      settingName: 'test',
      userUuid: '1-2-3',
      softDelete: true,
    })

    expect(settingRepository.update).toHaveBeenCalled()
  })

  it('should soft delete a setting with timestamp', async () => {
    await createUseCase().execute({
      settingName: 'test',
      userUuid: '1-2-3',
      softDelete: true,
      timestamp: 123,
    })

    expect(settingRepository.update).toHaveBeenCalled()
  })
})
