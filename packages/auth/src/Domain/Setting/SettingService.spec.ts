import 'reflect-metadata'

import { SettingName } from '@standardnotes/domain-core'
import { Logger } from 'winston'
import { EncryptionVersion } from '../Encryption/EncryptionVersion'
import { User } from '../User/User'
import { Setting } from './Setting'
import { SettingRepositoryInterface } from './SettingRepositoryInterface'

import { SettingService } from './SettingService'
import { SettingsAssociationServiceInterface } from './SettingsAssociationServiceInterface'
import { SettingInterpreterInterface } from './SettingInterpreterInterface'
import { SettingDecrypterInterface } from './SettingDecrypterInterface'
import { SettingFactoryInterface } from './SettingFactoryInterface'

describe('SettingService', () => {
  let setting: Setting
  let user: User
  let factory: SettingFactoryInterface
  let settingRepository: SettingRepositoryInterface
  let settingsAssociationService: SettingsAssociationServiceInterface
  let settingInterpreter: SettingInterpreterInterface
  let settingDecrypter: SettingDecrypterInterface
  let logger: Logger

  const createService = () =>
    new SettingService(
      factory,
      settingRepository,
      settingsAssociationService,
      settingInterpreter,
      settingDecrypter,
      logger,
    )

  beforeEach(() => {
    user = {
      uuid: '4-5-6',
    } as jest.Mocked<User>
    user.isPotentiallyAVaultAccount = jest.fn().mockReturnValue(false)

    setting = {} as jest.Mocked<Setting>

    factory = {} as jest.Mocked<SettingFactoryInterface>
    factory.create = jest.fn().mockReturnValue(setting)
    factory.createReplacement = jest.fn().mockReturnValue(setting)

    settingRepository = {} as jest.Mocked<SettingRepositoryInterface>
    settingRepository.findLastByNameAndUserUuid = jest.fn().mockReturnValue(null)
    settingRepository.findOneByNameAndUserUuid = jest.fn().mockReturnValue(null)
    settingRepository.save = jest.fn().mockImplementation((setting) => setting)

    settingsAssociationService = {} as jest.Mocked<SettingsAssociationServiceInterface>
    settingsAssociationService.getDefaultSettingsAndValuesForNewUser = jest.fn().mockReturnValue(
      new Map([
        [
          SettingName.NAMES.MuteSignInEmails,
          {
            value: 'not_muted',
            sensitive: 0,
            serverEncryptionVersion: EncryptionVersion.Unencrypted,
          },
        ],
      ]),
    )

    settingsAssociationService.getDefaultSettingsAndValuesForNewVaultAccount = jest.fn().mockReturnValue(
      new Map([
        [
          SettingName.NAMES.LogSessionUserAgent,
          {
            sensitive: false,
            serverEncryptionVersion: EncryptionVersion.Unencrypted,
            value: 'disabled',
          },
        ],
      ]),
    )

    settingInterpreter = {} as jest.Mocked<SettingInterpreterInterface>
    settingInterpreter.interpretSettingUpdated = jest.fn()

    settingDecrypter = {} as jest.Mocked<SettingDecrypterInterface>
    settingDecrypter.decryptSettingValue = jest.fn().mockReturnValue('decrypted')

    logger = {} as jest.Mocked<Logger>
    logger.debug = jest.fn()
    logger.warn = jest.fn()
    logger.error = jest.fn()
  })

  it('should create default settings for a newly registered user', async () => {
    await createService().applyDefaultSettingsUponRegistration(user)

    expect(settingRepository.save).toHaveBeenCalledWith(setting)
  })

  it('should create default settings for a newly registered vault account', async () => {
    user.isPotentiallyAVaultAccount = jest.fn().mockReturnValue(true)

    await createService().applyDefaultSettingsUponRegistration(user)

    expect(settingRepository.save).toHaveBeenCalledWith(setting)
  })

  it("should create setting if it doesn't exist", async () => {
    const result = await createService().createOrReplace({
      user,
      props: {
        name: 'name',
        unencryptedValue: 'value',
        serverEncryptionVersion: 1,
        sensitive: false,
      },
    })

    expect(result.status).toEqual('created')
  })

  it('should create setting with a given uuid if it does not exist', async () => {
    settingRepository.findOneByUuid = jest.fn().mockReturnValue(null)

    const result = await createService().createOrReplace({
      user,
      props: {
        uuid: '1-2-3',
        name: 'name',
        unencryptedValue: 'value',
        serverEncryptionVersion: 1,
        sensitive: false,
      },
    })

    expect(result.status).toEqual('created')
  })

  it('should replace setting if it does exist', async () => {
    settingRepository.findLastByNameAndUserUuid = jest.fn().mockReturnValue(setting)

    const result = await createService().createOrReplace({
      user: user,
      props: {
        ...setting,
        unencryptedValue: 'value',
        serverEncryptionVersion: 1,
      },
    })

    expect(result.status).toEqual('replaced')
  })

  it('should replace setting with a given uuid if it does exist', async () => {
    settingRepository.findOneByUuid = jest.fn().mockReturnValue(setting)

    const result = await createService().createOrReplace({
      user: user,
      props: {
        ...setting,
        uuid: '1-2-3',
        unencryptedValue: 'value',
        serverEncryptionVersion: 1,
      },
    })

    expect(result.status).toEqual('replaced')
  })

  it('should find and decrypt the value of a setting for user', async () => {
    setting = {
      value: 'encrypted',
      serverEncryptionVersion: EncryptionVersion.Default,
    } as jest.Mocked<Setting>

    settingRepository.findLastByNameAndUserUuid = jest.fn().mockReturnValue(setting)

    expect(await createService().findSettingWithDecryptedValue({ userUuid: '1-2-3', settingName: 'test' })).toEqual({
      serverEncryptionVersion: 1,
      value: 'decrypted',
    })
  })
})
