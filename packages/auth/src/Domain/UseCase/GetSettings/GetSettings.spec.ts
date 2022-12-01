import 'reflect-metadata'

import { SettingName } from '@standardnotes/settings'

import { SettingProjector } from '../../../Projection/SettingProjector'
import { Setting } from '../../Setting/Setting'
import { SettingRepositoryInterface } from '../../Setting/SettingRepositoryInterface'

import { GetSettings } from './GetSettings'
import { UserRepositoryInterface } from '../../User/UserRepositoryInterface'
import { User } from '../../User/User'
import { CrypterInterface } from '../../Encryption/CrypterInterface'
import { EncryptionVersion } from '../../Encryption/EncryptionVersion'

describe('GetSettings', () => {
  let settingRepository: SettingRepositoryInterface
  let settingProjector: SettingProjector
  let setting: Setting
  let mfaSetting: Setting
  let userRepository: UserRepositoryInterface
  let user: User
  let crypter: CrypterInterface

  const createUseCase = () => new GetSettings(settingRepository, settingProjector, userRepository, crypter)

  beforeEach(() => {
    setting = {
      name: 'test',
      updatedAt: 345,
      sensitive: false,
    } as jest.Mocked<Setting>

    mfaSetting = {
      name: SettingName.NAMES.MfaSecret,
      updatedAt: 122,
      sensitive: true,
    } as jest.Mocked<Setting>

    settingRepository = {} as jest.Mocked<SettingRepositoryInterface>
    settingRepository.findAllByUserUuid = jest.fn().mockReturnValue([setting, mfaSetting])

    settingProjector = {} as jest.Mocked<SettingProjector>
    settingProjector.projectManySimple = jest.fn().mockReturnValue([{ foo: 'bar' }])

    user = {} as jest.Mocked<User>

    userRepository = {} as jest.Mocked<UserRepositoryInterface>
    userRepository.findOneByUuid = jest.fn().mockReturnValue(user)

    crypter = {} as jest.Mocked<CrypterInterface>
    crypter.decryptForUser = jest.fn().mockReturnValue('decrypted')
  })

  it('should fail if a user is not found', async () => {
    userRepository.findOneByUuid = jest.fn().mockReturnValue(null)

    expect(await createUseCase().execute({ userUuid: '1-2-3' })).toEqual({
      success: false,
      error: {
        message: 'User 1-2-3 not found.',
      },
    })
  })

  it('should return all user settings except mfa', async () => {
    expect(await createUseCase().execute({ userUuid: '1-2-3' })).toEqual({
      success: true,
      userUuid: '1-2-3',
      settings: [{ foo: 'bar' }],
    })

    expect(settingProjector.projectManySimple).toHaveBeenCalledWith([setting])
  })

  it('should return all setting with decrypted values', async () => {
    setting = {
      name: 'test',
      updatedAt: 345,
      value: 'encrypted',
      serverEncryptionVersion: EncryptionVersion.Default,
    } as jest.Mocked<Setting>
    settingRepository.findAllByUserUuid = jest.fn().mockReturnValue([setting])

    expect(await createUseCase().execute({ userUuid: '1-2-3' })).toEqual({
      success: true,
      userUuid: '1-2-3',
      settings: [{ foo: 'bar' }],
    })

    expect(settingProjector.projectManySimple).toHaveBeenCalledWith([
      {
        name: 'test',
        updatedAt: 345,
        value: 'decrypted',
        serverEncryptionVersion: 1,
      },
    ])
  })

  it('should return all user settings of certain name', async () => {
    expect(
      await createUseCase().execute({ userUuid: '1-2-3', settingName: 'test', allowSensitiveRetrieval: true }),
    ).toEqual({
      success: true,
      userUuid: '1-2-3',
      settings: [{ foo: 'bar' }],
    })

    expect(settingProjector.projectManySimple).toHaveBeenCalledWith([setting])
  })

  it('should return all user settings updated after', async () => {
    expect(
      await createUseCase().execute({ userUuid: '1-2-3', allowSensitiveRetrieval: true, updatedAfter: 123 }),
    ).toEqual({
      success: true,
      userUuid: '1-2-3',
      settings: [{ foo: 'bar' }],
    })

    expect(settingProjector.projectManySimple).toHaveBeenCalledWith([setting])
  })

  it('should return all sensitive user settings if explicit', async () => {
    expect(await createUseCase().execute({ userUuid: '1-2-3', allowSensitiveRetrieval: true })).toEqual({
      success: true,
      userUuid: '1-2-3',
      settings: [{ foo: 'bar' }],
    })

    expect(settingProjector.projectManySimple).toHaveBeenCalledWith([setting, mfaSetting])
  })
})
