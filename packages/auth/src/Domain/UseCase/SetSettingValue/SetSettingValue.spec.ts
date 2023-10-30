import { TimerInterface } from '@standardnotes/time'
import { SettingRepositoryInterface } from '../../Setting/SettingRepositoryInterface'
import { GetSetting } from '../GetSetting/GetSetting'
import { SetSettingValue } from './SetSettingValue'
import { SettingsAssociationServiceInterface } from '../../Setting/SettingsAssociationServiceInterface'
import { RoleServiceInterface } from '../../Role/RoleServiceInterface'
import { SettingCrypterInterface } from '../../Setting/SettingCrypterInterface'
import { Result, SettingName, Timestamps, Uuid } from '@standardnotes/domain-core'
import { EncryptionVersion } from '../../Encryption/EncryptionVersion'
import { PermissionName } from '@standardnotes/features'
import { Setting } from '../../Setting/Setting'

describe('SetSettingValue', () => {
  let getSetting: GetSetting
  let settingRepository: SettingRepositoryInterface
  let timer: TimerInterface
  let settingsAssociationService: SettingsAssociationServiceInterface
  let roleService: RoleServiceInterface
  let settingCrypter: SettingCrypterInterface

  const createUseCase = () =>
    new SetSettingValue(getSetting, settingRepository, timer, settingsAssociationService, roleService, settingCrypter)

  beforeEach(() => {
    getSetting = {} as jest.Mocked<GetSetting>
    getSetting.execute = jest.fn().mockReturnValue(Result.fail('not found'))

    settingRepository = {} as jest.Mocked<SettingRepositoryInterface>
    settingRepository.insert = jest.fn()
    settingRepository.update = jest.fn()

    timer = {} as jest.Mocked<TimerInterface>
    timer.getTimestampInMicroseconds = jest.fn().mockReturnValue(123)

    settingsAssociationService = {} as jest.Mocked<SettingsAssociationServiceInterface>
    settingsAssociationService.getSensitivityForSetting = jest.fn().mockReturnValue(false)
    settingsAssociationService.getEncryptionVersionForSetting = jest.fn().mockReturnValue(EncryptionVersion.Unencrypted)
    settingsAssociationService.isSettingMutableByClient = jest.fn().mockReturnValue(true)
    settingsAssociationService.getPermissionAssociatedWithSetting = jest.fn().mockReturnValue(undefined)

    roleService = {} as jest.Mocked<RoleServiceInterface>
    roleService.userHasPermission = jest.fn().mockReturnValue(false)

    settingCrypter = {} as jest.Mocked<SettingCrypterInterface>
    settingCrypter.encryptValue = jest.fn().mockReturnValue('encrypted')
  })

  it('should return error when user uuid is invalid', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      userUuid: 'invalid',
      settingName: SettingName.NAMES.MfaSecret,
      value: 'value',
    })

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toBe('Given value is not a valid uuid: invalid')
  })

  it('should return error when setting name is invalid', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      settingName: 'invalid',
      value: 'value',
    })

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toBe('Invalid setting name: invalid')
  })

  it('should return error when setting name is a subscription setting', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      settingName: SettingName.NAMES.MuteSignInEmails,
      value: 'value',
    })

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toBe('Setting MUTE_SIGN_IN_EMAILS is a subscription setting!')
  })

  it('should return error if the setting is not mutable by client', async () => {
    settingsAssociationService.isSettingMutableByClient = jest.fn().mockReturnValue(false)
    const useCase = createUseCase()

    const result = await useCase.execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      settingName: SettingName.NAMES.ListedAuthorSecrets,
      value: 'value',
      checkUserPermissions: true,
    })

    expect(result.isFailed()).toBe(true)
  })

  it('should return error if user does not have permission to update setting', async () => {
    settingsAssociationService.getPermissionAssociatedWithSetting = jest
      .fn()
      .mockReturnValue(PermissionName.FilesLowStorageTier)

    const useCase = createUseCase()

    const result = await useCase.execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      settingName: SettingName.NAMES.MfaSecret,
      value: 'value',
      checkUserPermissions: true,
    })

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toBe(
      'User 00000000-0000-0000-0000-000000000000 does not have permission to update setting MFA_SECRET.',
    )
  })

  it('should update an existing setting', async () => {
    const setting = Setting.create({
      name: SettingName.NAMES.MfaSecret,
      value: '1243359u42395834',
      serverEncryptionVersion: EncryptionVersion.Default,
      userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      sensitive: true,
      timestamps: Timestamps.create(123, 123).getValue(),
    }).getValue()

    getSetting.execute = jest.fn().mockReturnValue(Result.ok({ setting }))

    const useCase = createUseCase()

    const result = await useCase.execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      settingName: SettingName.NAMES.MfaSecret,
      value: 'value',
    })

    expect(result.isFailed()).toBe(false)
    expect(settingRepository.update).toHaveBeenCalled()
  })

  it('should create a setting with checking user permissions', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      settingName: SettingName.NAMES.MfaSecret,
      value: 'value',
      checkUserPermissions: true,
    })

    expect(result.isFailed()).toBe(false)
    expect(settingRepository.insert).toHaveBeenCalled()
  })

  it('should insert a new setting if one does not exist', async () => {
    getSetting.execute = jest.fn().mockReturnValue(Result.fail('not found'))

    const useCase = createUseCase()

    const result = await useCase.execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      settingName: SettingName.NAMES.MfaSecret,
      value: 'value',
    })

    expect(result.isFailed()).toBe(false)
    expect(settingRepository.insert).toHaveBeenCalled()
  })

  it('should insert a new setting with encrypted value if encryption version is default', async () => {
    settingsAssociationService.getEncryptionVersionForSetting = jest.fn().mockReturnValue(EncryptionVersion.Default)

    const useCase = createUseCase()

    const result = await useCase.execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      settingName: SettingName.NAMES.MfaSecret,
      value: 'value',
    })

    expect(result.isFailed()).toBe(false)
    expect(settingRepository.insert).toHaveBeenCalled()
    expect(settingCrypter.encryptValue).toHaveBeenCalled()
  })

  it('should return error if new setting cannot be created', async () => {
    getSetting.execute = jest.fn().mockReturnValue(Result.fail('not found'))
    const mock = jest.spyOn(Setting, 'create')
    mock.mockReturnValue(Result.fail('Oops'))

    const useCase = createUseCase()

    const result = await useCase.execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      settingName: SettingName.NAMES.MfaSecret,
      value: 'value',
    })

    expect(result.isFailed()).toBe(true)

    mock.mockRestore()
  })
})
