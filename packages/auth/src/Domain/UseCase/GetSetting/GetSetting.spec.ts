import 'reflect-metadata'

import { SettingName } from '@standardnotes/settings'

import { SettingProjector } from '../../../Projection/SettingProjector'
import { Setting } from '../../Setting/Setting'
import { SettingServiceInterface } from '../../Setting/SettingServiceInterface'

import { GetSetting } from './GetSetting'
import { UserSubscriptionServiceInterface } from '../../Subscription/UserSubscriptionServiceInterface'
import { SubscriptionSettingProjector } from '../../../Projection/SubscriptionSettingProjector'
import { SubscriptionSettingServiceInterface } from '../../Setting/SubscriptionSettingServiceInterface'
import { SubscriptionSetting } from '../../Setting/SubscriptionSetting'
import { UserSubscription } from '../../Subscription/UserSubscription'
import { UserSubscriptionType } from '../../Subscription/UserSubscriptionType'

describe('GetSetting', () => {
  let settingProjector: SettingProjector
  let setting: Setting
  let subscriptionSetting: SubscriptionSetting
  let settingService: SettingServiceInterface
  let userSubscriptionService: UserSubscriptionServiceInterface
  let subscriptionSettingProjector: SubscriptionSettingProjector
  let subscriptionSettingService: SubscriptionSettingServiceInterface
  let regularSubscription: UserSubscription
  let sharedSubscription: UserSubscription

  const createUseCase = () =>
    new GetSetting(
      settingProjector,
      subscriptionSettingProjector,
      settingService,
      subscriptionSettingService,
      userSubscriptionService,
    )

  beforeEach(() => {
    setting = {} as jest.Mocked<Setting>

    subscriptionSetting = {
      sensitive: false,
    } as jest.Mocked<SubscriptionSetting>

    settingService = {} as jest.Mocked<SettingServiceInterface>
    settingService.findSettingWithDecryptedValue = jest.fn().mockReturnValue(setting)

    settingProjector = {} as jest.Mocked<SettingProjector>
    settingProjector.projectSimple = jest.fn().mockReturnValue({ foo: 'bar' })

    subscriptionSettingService = {} as jest.Mocked<SubscriptionSettingServiceInterface>
    subscriptionSettingService.findSubscriptionSettingWithDecryptedValue = jest
      .fn()
      .mockReturnValue(subscriptionSetting)

    regularSubscription = {
      uuid: '1-2-3',
      subscriptionType: UserSubscriptionType.Regular,
    } as jest.Mocked<UserSubscription>

    sharedSubscription = {
      uuid: '2-3-4',
      subscriptionType: UserSubscriptionType.Shared,
    } as jest.Mocked<UserSubscription>

    userSubscriptionService = {} as jest.Mocked<UserSubscriptionServiceInterface>
    userSubscriptionService.findRegularSubscriptionForUserUuid = jest
      .fn()
      .mockReturnValue({ regularSubscription: null, sharedSubscription: null })

    subscriptionSettingProjector = {} as jest.Mocked<SubscriptionSettingProjector>
    subscriptionSettingProjector.projectSimple = jest.fn().mockReturnValue({ foo: 'sub-bar' })
  })

  describe('no subscription', () => {
    it('should find a setting for user', async () => {
      const result = await createUseCase().execute({
        userUuid: '1-2-3',
        settingName: SettingName.NAMES.DropboxBackupFrequency,
      })
      expect(result.isFailed()).toBeFalsy()
      expect(result.getValue()).toEqual({
        userUuid: '1-2-3',
        setting: { foo: 'bar' },
      })
    })

    it('should not find a setting if the setting name is invalid', async () => {
      const result = await createUseCase().execute({ userUuid: '1-2-3', settingName: 'invalid' })
      expect(result.isFailed()).toBeTruthy()
    })

    it('should not get a setting for user if it does not exist', async () => {
      settingService.findSettingWithDecryptedValue = jest.fn().mockReturnValue(null)

      const result = await createUseCase().execute({
        userUuid: '1-2-3',
        settingName: SettingName.NAMES.DropboxBackupFrequency,
      })
      expect(result.isFailed()).toBeTruthy()
    })

    it('should not retrieve a sensitive setting for user', async () => {
      setting = {
        sensitive: true,
        name: SettingName.NAMES.MfaSecret,
      } as jest.Mocked<Setting>

      settingService.findSettingWithDecryptedValue = jest.fn().mockReturnValue(setting)

      const result = await createUseCase().execute({ userUuid: '1-2-3', settingName: SettingName.NAMES.MfaSecret })
      expect(result.isFailed()).toBeFalsy()
      expect(result.getValue()).toEqual({
        sensitive: true,
      })
    })

    it('should not retrieve a subscription setting for user', async () => {
      const result = await createUseCase().execute({
        userUuid: '1-2-3',
        settingName: SettingName.NAMES.MuteSignInEmails,
      })
      expect(result.isFailed()).toBeTruthy()
    })

    it('should retrieve a sensitive setting for user if explicitly told to', async () => {
      setting = {
        sensitive: true,
        name: SettingName.NAMES.MfaSecret,
      } as jest.Mocked<Setting>

      settingService.findSettingWithDecryptedValue = jest.fn().mockReturnValue(setting)

      const result = await createUseCase().execute({
        userUuid: '1-2-3',
        settingName: SettingName.NAMES.MfaSecret,
        allowSensitiveRetrieval: true,
      })
      expect(result.isFailed()).toBeFalsy()
      expect(result.getValue()).toEqual({
        userUuid: '1-2-3',
        setting: { foo: 'bar' },
      })
    })
  })

  describe('regular subscription', () => {
    beforeEach(() => {
      userSubscriptionService.findRegularSubscriptionForUserUuid = jest
        .fn()
        .mockReturnValue({ regularSubscription, sharedSubscription: null })
    })

    it('should find a setting for user', async () => {
      const result = await createUseCase().execute({
        userUuid: '1-2-3',
        settingName: SettingName.NAMES.MuteSignInEmails,
      })
      expect(result.isFailed()).toBeFalsy()
      expect(result.getValue()).toEqual({
        userUuid: '1-2-3',
        setting: { foo: 'sub-bar' },
      })
    })

    it('should not get a suscription setting for user if it does not exist', async () => {
      subscriptionSettingService.findSubscriptionSettingWithDecryptedValue = jest.fn().mockReturnValue(null)

      const result = await createUseCase().execute({
        userUuid: '1-2-3',
        settingName: SettingName.NAMES.MuteSignInEmails,
      })
      expect(result.isFailed()).toBeTruthy()
    })

    it('should not retrieve a sensitive subscription setting for user', async () => {
      subscriptionSetting.sensitive = true

      subscriptionSettingService.findSubscriptionSettingWithDecryptedValue = jest
        .fn()
        .mockReturnValue(subscriptionSetting)

      const result = await createUseCase().execute({
        userUuid: '1-2-3',
        settingName: SettingName.NAMES.MuteSignInEmails,
      })
      expect(result.isFailed()).toBeFalsy()
      expect(result.getValue()).toEqual({
        sensitive: true,
      })
    })
  })

  describe('shared subscription', () => {
    beforeEach(() => {
      userSubscriptionService.findRegularSubscriptionForUserUuid = jest
        .fn()
        .mockReturnValue({ regularSubscription, sharedSubscription })
    })

    it('should find a setting for user', async () => {
      const result = await createUseCase().execute({
        userUuid: '1-2-3',
        settingName: SettingName.NAMES.MuteSignInEmails,
      })
      expect(result.isFailed()).toBeFalsy()
      expect(result.getValue()).toEqual({
        userUuid: '1-2-3',
        setting: { foo: 'sub-bar' },
      })

      expect(subscriptionSettingService.findSubscriptionSettingWithDecryptedValue).toHaveBeenCalledWith({
        subscriptionSettingName: SettingName.create(SettingName.NAMES.MuteSignInEmails).getValue(),
        userSubscriptionUuid: '2-3-4',
        userUuid: '1-2-3',
      })
    })

    it('should find a regular subscription only setting for user', async () => {
      const result = await createUseCase().execute({
        userUuid: '1-2-3',
        settingName: SettingName.NAMES.FileUploadBytesLimit,
      })
      expect(result.isFailed()).toBeFalsy()
      expect(result.getValue()).toEqual({
        userUuid: '1-2-3',
        setting: { foo: 'sub-bar' },
      })

      expect(subscriptionSettingService.findSubscriptionSettingWithDecryptedValue).toHaveBeenCalledWith({
        subscriptionSettingName: SettingName.create(SettingName.NAMES.FileUploadBytesLimit).getValue(),
        userSubscriptionUuid: '1-2-3',
        userUuid: '1-2-3',
      })
    })
  })
})
