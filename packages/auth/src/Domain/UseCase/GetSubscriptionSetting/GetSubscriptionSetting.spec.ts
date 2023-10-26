import { SettingName, Timestamps, Uuid } from '@standardnotes/domain-core'
import { EncryptionVersion } from '../../Encryption/EncryptionVersion'
import { SettingCrypterInterface } from '../../Setting/SettingCrypterInterface'
import { SubscriptionSetting } from '../../Setting/SubscriptionSetting'
import { SubscriptionSettingRepositoryInterface } from '../../Setting/SubscriptionSettingRepositoryInterface'
import { GetSubscriptionSetting } from './GetSubscriptionSetting'

describe('GetSubscriptionSetting', () => {
  let subscriptionSettingRepository: SubscriptionSettingRepositoryInterface
  let settingCrypter: SettingCrypterInterface

  const createUseCase = () => new GetSubscriptionSetting(subscriptionSettingRepository, settingCrypter)

  beforeEach(() => {
    const subscriptionSetting = SubscriptionSetting.create({
      sensitive: false,
      name: SettingName.NAMES.FileUploadBytesLimit,
      value: '100',
      timestamps: Timestamps.create(123456789, 123456789).getValue(),
      serverEncryptionVersion: EncryptionVersion.Unencrypted,
      userSubscriptionUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
    }).getValue()

    subscriptionSettingRepository = {} as jest.Mocked<SubscriptionSettingRepositoryInterface>
    subscriptionSettingRepository.findLastByNameAndUserSubscriptionUuid = jest
      .fn()
      .mockResolvedValue(subscriptionSetting)

    settingCrypter = {} as jest.Mocked<SettingCrypterInterface>
    settingCrypter.decryptSubscriptionSettingValue = jest.fn().mockResolvedValue('decrypted')
  })

  it('returns error when setting name is invalid', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      settingName: 'invalid',
      userSubscriptionUuid: '00000000-0000-0000-0000-000000000000',
      allowSensitiveRetrieval: false,
    })

    expect(result.isFailed()).toBe(true)
  })

  it('returns error when user subscription uuid is invalid', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      settingName: SettingName.NAMES.FileUploadBytesLimit,
      userSubscriptionUuid: 'invalid',
      allowSensitiveRetrieval: false,
    })

    expect(result.isFailed()).toBe(true)
  })

  it('returns error when setting is not found', async () => {
    const useCase = createUseCase()
    subscriptionSettingRepository.findLastByNameAndUserSubscriptionUuid = jest.fn().mockResolvedValue(null)

    const result = await useCase.execute({
      settingName: SettingName.NAMES.FileUploadBytesLimit,
      userSubscriptionUuid: '00000000-0000-0000-0000-000000000000',
      allowSensitiveRetrieval: false,
    })

    expect(result.isFailed()).toBe(true)
  })

  it('returns error when setting is sensitive and sensitive retrieval is not allowed', async () => {
    const useCase = createUseCase()
    subscriptionSettingRepository.findLastByNameAndUserSubscriptionUuid = jest.fn().mockResolvedValue(
      SubscriptionSetting.create({
        sensitive: true,
        name: SettingName.NAMES.FileUploadBytesLimit,
        value: '100',
        timestamps: Timestamps.create(123456789, 123456789).getValue(),
        serverEncryptionVersion: EncryptionVersion.Unencrypted,
        userSubscriptionUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      }).getValue(),
    )

    const result = await useCase.execute({
      settingName: SettingName.NAMES.FileUploadBytesLimit,
      userSubscriptionUuid: '00000000-0000-0000-0000-000000000000',
      allowSensitiveRetrieval: false,
    })

    expect(result.isFailed()).toBe(true)
  })

  it('returns setting when setting is sensitive and sensitive retrieval is allowed', async () => {
    const useCase = createUseCase()
    subscriptionSettingRepository.findLastByNameAndUserSubscriptionUuid = jest.fn().mockResolvedValue(
      SubscriptionSetting.create({
        sensitive: true,
        name: SettingName.NAMES.FileUploadBytesLimit,
        value: '100',
        timestamps: Timestamps.create(123456789, 123456789).getValue(),
        serverEncryptionVersion: EncryptionVersion.Unencrypted,
        userSubscriptionUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      }).getValue(),
    )

    const result = await useCase.execute({
      settingName: SettingName.NAMES.FileUploadBytesLimit,
      userSubscriptionUuid: '00000000-0000-0000-0000-000000000000',
      allowSensitiveRetrieval: true,
    })

    expect(result.isFailed()).toBe(false)
  })

  it('returns setting when setting is not sensitive', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      settingName: SettingName.NAMES.FileUploadBytesLimit,
      userSubscriptionUuid: '00000000-0000-0000-0000-000000000000',
      allowSensitiveRetrieval: false,
    })

    expect(result.isFailed()).toBe(false)
  })

  it('return a decrypted setting', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      settingName: SettingName.NAMES.FileUploadBytesLimit,
      userSubscriptionUuid: '00000000-0000-0000-0000-000000000000',
      allowSensitiveRetrieval: false,
      decryptWith: {
        userUuid: '00000000-0000-0000-0000-000000000000',
      },
    })

    expect(result.isFailed()).toBe(false)
    expect(result.getValue().decryptedValue).toEqual('decrypted')
  })

  it('should return error if decrypting with invalid user uuid', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      settingName: SettingName.NAMES.FileUploadBytesLimit,
      userSubscriptionUuid: '00000000-0000-0000-0000-000000000000',
      allowSensitiveRetrieval: false,
      decryptWith: {
        userUuid: 'invalid',
      },
    })

    expect(result.isFailed()).toBe(true)
  })

  it('return error when setting name is not a subscription setting', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      settingName: SettingName.NAMES.EmailBackupFrequency,
      userSubscriptionUuid: '00000000-0000-0000-0000-000000000000',
      allowSensitiveRetrieval: false,
    })

    expect(result.isFailed()).toBe(true)
  })
})
