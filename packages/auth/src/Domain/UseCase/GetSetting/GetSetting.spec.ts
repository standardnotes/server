import { SettingName } from '@standardnotes/settings'
import { SettingCrypterInterface } from '../../Setting/SettingCrypterInterface'
import { SettingRepositoryInterface } from '../../Setting/SettingRepositoryInterface'
import { GetSetting } from './GetSetting'
import { Setting } from '../../Setting/Setting'
import { Uuid, Timestamps } from '@standardnotes/domain-core'

describe('GetSetting', () => {
  let settingRepository: SettingRepositoryInterface
  let settingCrypter: SettingCrypterInterface

  const createUseCase = () => new GetSetting(settingRepository, settingCrypter)

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
