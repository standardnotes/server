import { Logger } from 'winston'
import { SettingRepositoryInterface } from '../../Setting/SettingRepositoryInterface'
import { TriggerEmailBackupForUser } from '../TriggerEmailBackupForUser/TriggerEmailBackupForUser'
import { TriggerEmailBackupForAllUsers } from './TriggerEmailBackupForAllUsers'
import { EncryptionVersion } from '../../Encryption/EncryptionVersion'

import { Setting } from '../../Setting/Setting'
import { Result, SettingName, Timestamps, Uuid } from '@standardnotes/domain-core'

describe('TriggerEmailBackupForAllUsers', () => {
  let settingRepository: SettingRepositoryInterface
  let triggerEmailBackupForUserUseCase: TriggerEmailBackupForUser
  let logger: Logger

  const createUseCase = () =>
    new TriggerEmailBackupForAllUsers(settingRepository, triggerEmailBackupForUserUseCase, logger)

  beforeEach(() => {
    const setting = Setting.create({
      name: SettingName.NAMES.EmailBackupFrequency,
      value: null,
      serverEncryptionVersion: EncryptionVersion.Default,
      userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      sensitive: false,
      timestamps: Timestamps.create(123, 123).getValue(),
    }).getValue()

    settingRepository = {} as jest.Mocked<SettingRepositoryInterface>
    settingRepository.countAllByNameAndValue = jest.fn().mockResolvedValue(1)
    settingRepository.findAllByNameAndValue = jest.fn().mockResolvedValue([setting])

    triggerEmailBackupForUserUseCase = {} as jest.Mocked<TriggerEmailBackupForUser>
    triggerEmailBackupForUserUseCase.execute = jest.fn().mockResolvedValue(Result.ok())

    logger = {} as jest.Mocked<Logger>
    logger.error = jest.fn()
    logger.info = jest.fn()
  })

  it('triggers email backup for all users', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({ backupFrequency: 'daily' })

    expect(result.isFailed()).toBeFalsy()
  })
})
