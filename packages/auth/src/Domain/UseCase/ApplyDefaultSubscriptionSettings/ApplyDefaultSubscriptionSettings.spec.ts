import { Result, SettingName, SubscriptionPlanName, Timestamps, Uuid } from '@standardnotes/domain-core'
import { SubscriptionSetting } from '../../Setting/SubscriptionSetting'
import { SubscriptionSettingsAssociationServiceInterface } from '../../Setting/SubscriptionSettingsAssociationServiceInterface'
import { UserSubscription } from '../../Subscription/UserSubscription'
import { UserSubscriptionRepositoryInterface } from '../../Subscription/UserSubscriptionRepositoryInterface'
import { GetSubscriptionSetting } from '../GetSubscriptionSetting/GetSubscriptionSetting'
import { SetSubscriptionSettingValue } from '../SetSubscriptionSettingValue/SetSubscriptionSettingValue'
import { ApplyDefaultSubscriptionSettings } from './ApplyDefaultSubscriptionSettings'
import { EncryptionVersion } from '../../Encryption/EncryptionVersion'

describe('ApplyDefaultSubscriptionSettings', () => {
  let subscriptionSettingAssociationService: SubscriptionSettingsAssociationServiceInterface
  let userSubscriptionRepository: UserSubscriptionRepositoryInterface
  let getSubscriptionSetting: GetSubscriptionSetting
  let setSubscriptionSettingValue: SetSubscriptionSettingValue

  const createUseCase = () =>
    new ApplyDefaultSubscriptionSettings(
      subscriptionSettingAssociationService,
      userSubscriptionRepository,
      getSubscriptionSetting,
      setSubscriptionSettingValue,
    )

  beforeEach(() => {
    subscriptionSettingAssociationService = {} as jest.Mocked<SubscriptionSettingsAssociationServiceInterface>
    subscriptionSettingAssociationService.getDefaultSettingsAndValuesForSubscriptionName = jest.fn().mockReturnValue(
      new Map([
        [
          SettingName.NAMES.MuteSignInEmails,
          { value: 'value1', sensitive: false, serverEncryptionVersion: 0, replaceable: true },
        ],
        [
          SettingName.NAMES.FileUploadBytesLimit,
          { value: 'value2', sensitive: false, serverEncryptionVersion: 0, replaceable: false },
        ],
      ]),
    )

    userSubscriptionRepository = {} as jest.Mocked<UserSubscriptionRepositoryInterface>
    userSubscriptionRepository.findByUserUuid = jest.fn().mockReturnValue([
      {
        uuid: '1-2-3',
      } as jest.Mocked<UserSubscription>,
    ])

    getSubscriptionSetting = {} as jest.Mocked<GetSubscriptionSetting>
    getSubscriptionSetting.execute = jest.fn().mockReturnValue(
      Result.ok({
        setting: SubscriptionSetting.create({
          sensitive: false,
          name: SettingName.NAMES.FileUploadBytesLimit,
          value: '100',
          timestamps: Timestamps.create(123456789, 123456789).getValue(),
          serverEncryptionVersion: EncryptionVersion.Unencrypted,
          userSubscriptionUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
        }).getValue(),
      }),
    )

    setSubscriptionSettingValue = {} as jest.Mocked<SetSubscriptionSettingValue>
    setSubscriptionSettingValue.execute = jest.fn().mockReturnValue(Result.ok())
  })

  it('should set default settings for a subscription', async () => {
    const result = await createUseCase().execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      userSubscriptionUuid: '00000000-0000-0000-0000-000000000000',
      subscriptionPlanName: SubscriptionPlanName.NAMES.ProPlan,
    })

    expect(result.isFailed()).toBeFalsy()
    expect(setSubscriptionSettingValue.execute).toHaveBeenCalledTimes(2)
  })

  it('should fail if user uuid is invalid', async () => {
    const result = await createUseCase().execute({
      userUuid: 'invalid',
      userSubscriptionUuid: '00000000-0000-0000-0000-000000000000',
      subscriptionPlanName: SubscriptionPlanName.NAMES.ProPlan,
    })

    expect(result.isFailed()).toBeTruthy()
  })

  it('should fail if user subscription uuid is invalid', async () => {
    const result = await createUseCase().execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      userSubscriptionUuid: 'invalid',
      subscriptionPlanName: SubscriptionPlanName.NAMES.ProPlan,
    })

    expect(result.isFailed()).toBeTruthy()
  })

  it('should fail if subscription plan name is invalid', async () => {
    const result = await createUseCase().execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      userSubscriptionUuid: '00000000-0000-0000-0000-000000000000',
      subscriptionPlanName: 'invalid',
    })

    expect(result.isFailed()).toBeTruthy()
  })

  it('should fail if subscription setting for plan name are not found', async () => {
    subscriptionSettingAssociationService.getDefaultSettingsAndValuesForSubscriptionName = jest
      .fn()
      .mockReturnValue(undefined)

    const result = await createUseCase().execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      userSubscriptionUuid: '00000000-0000-0000-0000-000000000000',
      subscriptionPlanName: SubscriptionPlanName.NAMES.ProPlan,
    })

    expect(result.isFailed()).toBeTruthy()
  })

  it('shold fail if subscription setting name is invalid', async () => {
    subscriptionSettingAssociationService.getDefaultSettingsAndValuesForSubscriptionName = jest
      .fn()
      .mockReturnValue(new Map([['invalid', { value: 'value1', sensitive: false, serverEncryptionVersion: 0 }]]))

    const result = await createUseCase().execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      userSubscriptionUuid: '00000000-0000-0000-0000-000000000000',
      subscriptionPlanName: SubscriptionPlanName.NAMES.ProPlan,
    })

    expect(result.isFailed()).toBeTruthy()
  })

  it('should fail if subscription setting name is not a subscription setting', async () => {
    subscriptionSettingAssociationService.getDefaultSettingsAndValuesForSubscriptionName = jest
      .fn()
      .mockReturnValue(
        new Map([
          [SettingName.NAMES.LogSessionUserAgent, { value: 'value1', sensitive: false, serverEncryptionVersion: 0 }],
        ]),
      )

    const result = await createUseCase().execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      userSubscriptionUuid: '00000000-0000-0000-0000-000000000000',
      subscriptionPlanName: SubscriptionPlanName.NAMES.ProPlan,
    })

    expect(result.isFailed()).toBeTruthy()
  })

  it('should fail if setting the subcription setting value fails', async () => {
    setSubscriptionSettingValue.execute = jest.fn().mockReturnValue(Result.fail('error'))

    const result = await createUseCase().execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      userSubscriptionUuid: '00000000-0000-0000-0000-000000000000',
      subscriptionPlanName: SubscriptionPlanName.NAMES.ProPlan,
    })

    expect(result.isFailed()).toBeTruthy()
  })

  it('should create new setting if cannot find previous subscription for a non replacable setting', async () => {
    userSubscriptionRepository.findByUserUuid = jest.fn().mockReturnValue([])

    const result = await createUseCase().execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      userSubscriptionUuid: '00000000-0000-0000-0000-000000000000',
      subscriptionPlanName: SubscriptionPlanName.NAMES.ProPlan,
    })

    expect(result.isFailed()).toBeFalsy()
    expect(setSubscriptionSettingValue.execute).toHaveBeenCalledTimes(2)
  })

  it('should allow to override setting values if setting is replacable', async () => {
    const result = await createUseCase().execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      userSubscriptionUuid: '00000000-0000-0000-0000-000000000000',
      subscriptionPlanName: SubscriptionPlanName.NAMES.ProPlan,
      overrides: new Map([
        [SettingName.NAMES.MuteSignInEmails, '000'],
        [SettingName.NAMES.FileUploadBytesLimit, '000'],
      ]),
    })

    expect(result.isFailed()).toBeFalsy()
    expect(setSubscriptionSettingValue.execute).toHaveBeenCalledTimes(2)
  })
})
