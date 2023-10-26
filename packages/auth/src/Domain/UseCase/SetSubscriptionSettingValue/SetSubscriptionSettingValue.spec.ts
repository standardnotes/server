import { TimerInterface } from '@standardnotes/time'
import { SubscriptionSettingRepositoryInterface } from '../../Setting/SubscriptionSettingRepositoryInterface'
import { GetSubscriptionSetting } from '../GetSubscriptionSetting/GetSubscriptionSetting'
import { SetSubscriptionSettingValue } from './SetSubscriptionSettingValue'
import { Result, Timestamps, Uuid } from '@standardnotes/domain-core'
import { SettingName } from '@standardnotes/settings'
import { EncryptionVersion } from '../../Encryption/EncryptionVersion'
import { SubscriptionSetting } from '../../Setting/SubscriptionSetting'

describe('SetSubscriptionSettingValue', () => {
  let subscriptionSettingRepository: SubscriptionSettingRepositoryInterface
  let getSubscriptionSetting: GetSubscriptionSetting
  let timer: TimerInterface

  const createUseCase = () =>
    new SetSubscriptionSettingValue(subscriptionSettingRepository, getSubscriptionSetting, timer)

  beforeEach(() => {
    subscriptionSettingRepository = {} as jest.Mocked<SubscriptionSettingRepositoryInterface>
    subscriptionSettingRepository.insert = jest.fn()
    subscriptionSettingRepository.update = jest.fn()

    getSubscriptionSetting = {} as jest.Mocked<GetSubscriptionSetting>
    getSubscriptionSetting.execute = jest.fn().mockReturnValue(Result.fail('not found'))

    timer = {} as jest.Mocked<TimerInterface>
    timer.getTimestampInMicroseconds = jest.fn().mockReturnValue(123)
  })

  it('should return error when user subscription uuid is invalid', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      userSubscriptionUuid: 'invalid',
      settingName: SettingName.NAMES.MuteSignInEmails,
      value: 'value',
    })

    expect(result.isFailed()).toBe(true)
  })

  it('should return error when setting name is invalid', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      userSubscriptionUuid: '00000000-0000-0000-0000-000000000000',
      settingName: 'invalid',
      value: 'value',
    })

    expect(result.isFailed()).toBe(true)
  })

  it('should return error when setting name is not a subscription setting', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      userSubscriptionUuid: '00000000-0000-0000-0000-000000000000',
      settingName: SettingName.NAMES.MfaSecret,
      value: 'value',
    })

    expect(result.isFailed()).toBe(true)
  })

  it('should return error when provided new subscription uuid is invalid', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      userSubscriptionUuid: '00000000-0000-0000-0000-000000000000',
      settingName: SettingName.NAMES.MuteSignInEmails,
      value: 'value',
      newUserSubscriptionUuid: 'invalid',
    })

    expect(result.isFailed()).toBe(true)
  })

  it('should update an existing subscription setting', async () => {
    const setting = SubscriptionSetting.create({
      name: SettingName.NAMES.MuteSignInEmails,
      value: 'encrypted',
      sensitive: true,
      serverEncryptionVersion: EncryptionVersion.Default,
      userSubscriptionUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      timestamps: Timestamps.create(123, 123).getValue(),
    }).getValue()

    getSubscriptionSetting.execute = jest.fn().mockReturnValue(Result.ok({ setting }))

    const useCase = createUseCase()

    const result = await useCase.execute({
      userSubscriptionUuid: '00000000-0000-0000-0000-000000000000',
      settingName: SettingName.NAMES.MuteSignInEmails,
      value: 'encrypted',
    })

    expect(result.isFailed()).toBe(false)
    expect(subscriptionSettingRepository.update).toHaveBeenCalled()
  })

  it('should insert a new subscription setting', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      userSubscriptionUuid: '00000000-0000-0000-0000-000000000000',
      settingName: SettingName.NAMES.MuteSignInEmails,
      value: 'encrypted',
    })

    expect(result.isFailed()).toBe(false)
    expect(subscriptionSettingRepository.insert).toHaveBeenCalled()
  })

  it('should return error if subscription setting could not be created', async () => {
    const mock = jest.spyOn(SubscriptionSetting, 'create')
    mock.mockReturnValue(Result.fail('Oops'))

    const useCase = createUseCase()

    const result = await useCase.execute({
      userSubscriptionUuid: '00000000-0000-0000-0000-000000000000',
      settingName: SettingName.NAMES.MuteSignInEmails,
      value: 'encrypted',
    })

    expect(result.isFailed()).toBe(true)

    mock.mockRestore()
  })

  it('should update an existing subscription setting with a new user subscription uuid', async () => {
    const setting = SubscriptionSetting.create({
      name: SettingName.NAMES.MuteSignInEmails,
      value: 'encrypted',
      sensitive: true,
      serverEncryptionVersion: EncryptionVersion.Default,
      userSubscriptionUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      timestamps: Timestamps.create(123, 123).getValue(),
    }).getValue()

    getSubscriptionSetting.execute = jest.fn().mockReturnValue(Result.ok({ setting }))

    const useCase = createUseCase()

    const result = await useCase.execute({
      userSubscriptionUuid: '00000000-0000-0000-0000-000000000000',
      settingName: SettingName.NAMES.MuteSignInEmails,
      value: 'encrypted',
      newUserSubscriptionUuid: '00000000-0000-0000-0000-000000000001',
    })

    expect(result.isFailed()).toBe(false)
    expect(subscriptionSettingRepository.update).toHaveBeenCalled()
  })
})
