import { SettingCrypterInterface } from '../../Setting/SettingCrypterInterface'
import { SettingRepositoryInterface } from '../../Setting/SettingRepositoryInterface'
import { GetSetting } from './GetSetting'
import { Setting } from '../../Setting/Setting'
import { Uuid, Timestamps, SettingName, Result } from '@standardnotes/domain-core'
import { VerifyUserServerPassword } from '../VerifyUserServerPassword/VerifyUserServerPassword'

describe('GetSetting', () => {
  let settingRepository: SettingRepositoryInterface
  let settingCrypter: SettingCrypterInterface
  let verifyUserServerPassword: VerifyUserServerPassword

  const createUseCase = () => new GetSetting(settingRepository, settingCrypter, verifyUserServerPassword)

  beforeEach(() => {
    const setting = Setting.create({
      name: SettingName.NAMES.LogSessionUserAgent,
      value: 'test',
      serverEncryptionVersion: 0,
      userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      sensitive: false,
      timestamps: Timestamps.create(123, 123).getValue(),
    }).getValue()

    settingRepository = {} as jest.Mocked<SettingRepositoryInterface>
    settingRepository.findLastByNameAndUserUuid = jest.fn().mockReturnValue(setting)

    settingCrypter = {} as jest.Mocked<SettingCrypterInterface>
    settingCrypter.decryptSettingValue = jest.fn().mockReturnValue('decrypted')

    verifyUserServerPassword = {} as jest.Mocked<VerifyUserServerPassword>
    verifyUserServerPassword.execute = jest.fn()
  })

  it('should return a setting', async () => {
    const result = await createUseCase().execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      settingName: SettingName.NAMES.ExtensionKey,
      allowSensitiveRetrieval: false,
      decrypted: false,
    })

    expect(result.isFailed()).toBeFalsy()
  })

  it('should require password for recovery codes setting', async () => {
    verifyUserServerPassword.execute = jest
      .fn()
      .mockReturnValue(Result.fail('Please update your application to the latest version.'))

    const setting = Setting.create({
      name: SettingName.NAMES.RecoveryCodes,
      value: 'test-recovery-codes',
      serverEncryptionVersion: 0,
      userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      sensitive: false,
      timestamps: Timestamps.create(123, 123).getValue(),
    }).getValue()
    settingRepository.findLastByNameAndUserUuid = jest.fn().mockReturnValue(setting)

    const result = await createUseCase().execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      settingName: SettingName.NAMES.RecoveryCodes,
      allowSensitiveRetrieval: false,
      decrypted: false,
      shouldVerifyUserServerPassword: true,
    })

    expect(result.isFailed()).toBeTruthy()
    expect(result.getError()).toEqual('Please update your application to the latest version.')
    expect(verifyUserServerPassword.execute).toHaveBeenCalledWith({
      userUuid: '00000000-0000-0000-0000-000000000000',
      serverPassword: undefined,
    })
  })

  it('should allow recovery codes with correct password', async () => {
    verifyUserServerPassword.execute = jest.fn().mockReturnValue(Result.ok())

    const setting = Setting.create({
      name: SettingName.NAMES.RecoveryCodes,
      value: 'test-recovery-codes',
      serverEncryptionVersion: 0,
      userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      sensitive: false,
      timestamps: Timestamps.create(123, 123).getValue(),
    }).getValue()
    settingRepository.findLastByNameAndUserUuid = jest.fn().mockReturnValue(setting)

    const result = await createUseCase().execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      settingName: SettingName.NAMES.RecoveryCodes,
      allowSensitiveRetrieval: false,
      decrypted: false,
      serverPassword: 'correct-password',
      shouldVerifyUserServerPassword: true,
    })

    expect(verifyUserServerPassword.execute).toHaveBeenCalledWith({
      userUuid: '00000000-0000-0000-0000-000000000000',
      serverPassword: 'correct-password',
    })
    expect(result.isFailed()).toBeFalsy()
  })

  it('should return recovery codes setting', async () => {
    const setting = Setting.create({
      name: SettingName.NAMES.RecoveryCodes,
      value: 'test-recovery-codes',
      serverEncryptionVersion: 0,
      userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      sensitive: false,
      timestamps: Timestamps.create(123, 123).getValue(),
    }).getValue()
    settingRepository.findLastByNameAndUserUuid = jest.fn().mockReturnValue(setting)

    const result = await createUseCase().execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      settingName: SettingName.NAMES.RecoveryCodes,
      allowSensitiveRetrieval: false,
      decrypted: false,
      shouldVerifyUserServerPassword: false,
    })

    expect(result.isFailed()).toBeFalsy()
    expect(result.getValue().setting.props.name).toEqual(SettingName.NAMES.RecoveryCodes)
    expect(result.getValue().setting.props.value).toEqual('test-recovery-codes')
  })

  it('should fail recovery codes with incorrect password', async () => {
    verifyUserServerPassword.execute = jest
      .fn()
      .mockReturnValue(Result.fail('The password you entered is incorrect. Please try again.'))

    const setting = Setting.create({
      name: SettingName.NAMES.RecoveryCodes,
      value: 'test-recovery-codes',
      serverEncryptionVersion: 0,
      userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      sensitive: false,
      timestamps: Timestamps.create(123, 123).getValue(),
    }).getValue()
    settingRepository.findLastByNameAndUserUuid = jest.fn().mockReturnValue(setting)

    const result = await createUseCase().execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      settingName: SettingName.NAMES.RecoveryCodes,
      allowSensitiveRetrieval: false,
      decrypted: false,
      serverPassword: 'wrong-password',
      shouldVerifyUserServerPassword: true,
    })

    expect(verifyUserServerPassword.execute).toHaveBeenCalledWith({
      userUuid: '00000000-0000-0000-0000-000000000000',
      serverPassword: 'wrong-password',
    })
    expect(result.isFailed()).toBeTruthy()
    expect(result.getError()).toEqual('The password you entered is incorrect. Please try again.')
  })

  it('should skip password validation when shouldVerifyUserServerPassword is false', async () => {
    const setting = Setting.create({
      name: SettingName.NAMES.RecoveryCodes,
      value: 'test-recovery-codes',
      serverEncryptionVersion: 0,
      userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      sensitive: false,
      timestamps: Timestamps.create(123, 123).getValue(),
    }).getValue()
    settingRepository.findLastByNameAndUserUuid = jest.fn().mockReturnValue(setting)

    const result = await createUseCase().execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      settingName: SettingName.NAMES.RecoveryCodes,
      allowSensitiveRetrieval: false,
      decrypted: false,
      shouldVerifyUserServerPassword: false,
    })

    expect(verifyUserServerPassword.execute).not.toHaveBeenCalled()
    expect(result.isFailed()).toBeFalsy()
  })

  it('should fail recovery codes with invalid user UUID during password validation', async () => {
    const result = await createUseCase().execute({
      userUuid: 'invalid-uuid-format',
      settingName: SettingName.NAMES.RecoveryCodes,
      allowSensitiveRetrieval: false,
      decrypted: false,
      serverPassword: 'some-password',
    })

    expect(result.isFailed()).toBeTruthy()
    expect(result.getError()).toContain('invalid-uuid-format')
    // Password verification should NOT be called because UUID validation fails first
    expect(verifyUserServerPassword.execute).not.toHaveBeenCalled()
  })

  it('should fail recovery codes when user not found during password validation', async () => {
    verifyUserServerPassword.execute = jest.fn().mockReturnValue(Result.fail('User not found.'))

    const setting = Setting.create({
      name: SettingName.NAMES.RecoveryCodes,
      value: 'test-recovery-codes',
      serverEncryptionVersion: 0,
      userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      sensitive: false,
      timestamps: Timestamps.create(123, 123).getValue(),
    }).getValue()
    settingRepository.findLastByNameAndUserUuid = jest.fn().mockReturnValue(setting)

    const result = await createUseCase().execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      settingName: SettingName.NAMES.RecoveryCodes,
      allowSensitiveRetrieval: false,
      decrypted: false,
      serverPassword: 'some-password',
      shouldVerifyUserServerPassword: true,
    })

    expect(result.isFailed()).toBeTruthy()
    expect(result.getError()).toEqual('User not found.')
    expect(verifyUserServerPassword.execute).toHaveBeenCalledWith({
      userUuid: '00000000-0000-0000-0000-000000000000',
      serverPassword: 'some-password',
    })
  })

  it('should return error if setting is a subscription setting', async () => {
    const result = await createUseCase().execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      settingName: SettingName.NAMES.MuteSignInEmails,
      allowSensitiveRetrieval: false,
      decrypted: false,
    })

    expect(result.isFailed()).toBeTruthy()
  })

  it('should return a decrypted setting', async () => {
    const result = await createUseCase().execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      settingName: SettingName.NAMES.ExtensionKey,
      allowSensitiveRetrieval: false,
      decrypted: true,
    })

    expect(result.isFailed()).toBeFalsy()
    expect(result.getValue().decryptedValue).toEqual('decrypted')
  })

  it('should not allow sensitive retrieval', async () => {
    const setting = Setting.create({
      name: SettingName.NAMES.LogSessionUserAgent,
      value: 'test',
      serverEncryptionVersion: 0,
      userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      sensitive: true,
      timestamps: Timestamps.create(123, 123).getValue(),
    }).getValue()
    settingRepository = {} as jest.Mocked<SettingRepositoryInterface>
    settingRepository.findLastByNameAndUserUuid = jest.fn().mockReturnValue(setting)

    const result = await createUseCase().execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      settingName: SettingName.NAMES.ExtensionKey,
      allowSensitiveRetrieval: false,
      decrypted: true,
    })

    expect(result.isFailed()).toBeTruthy()
  })

  it('should allow sensitive retrieval if explicitly allowed', async () => {
    const setting = Setting.create({
      name: SettingName.NAMES.LogSessionUserAgent,
      value: 'test',
      serverEncryptionVersion: 0,
      userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      sensitive: true,
      timestamps: Timestamps.create(123, 123).getValue(),
    }).getValue()
    settingRepository = {} as jest.Mocked<SettingRepositoryInterface>
    settingRepository.findLastByNameAndUserUuid = jest.fn().mockReturnValue(setting)

    const result = await createUseCase().execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      settingName: SettingName.NAMES.ExtensionKey,
      allowSensitiveRetrieval: true,
      decrypted: true,
    })

    expect(result.isFailed()).toBeFalsy()
  })

  it('should return error if user uuid is invalid', async () => {
    const result = await createUseCase().execute({
      userUuid: 'invalid',
      settingName: SettingName.NAMES.ExtensionKey,
      allowSensitiveRetrieval: false,
      decrypted: false,
    })

    expect(result.isFailed()).toBeTruthy()
  })

  it('should return error if setting name is invalid', async () => {
    const result = await createUseCase().execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      settingName: 'invalid',
      allowSensitiveRetrieval: false,
      decrypted: false,
    })

    expect(result.isFailed()).toBeTruthy()
  })

  it('should fail if the setting is not found', async () => {
    settingRepository.findLastByNameAndUserUuid = jest.fn().mockReturnValue(null)

    const result = await createUseCase().execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      settingName: SettingName.NAMES.ExtensionKey,
      allowSensitiveRetrieval: false,
      decrypted: false,
    })

    expect(result.isFailed()).toBeTruthy()
  })
})
