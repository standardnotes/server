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
import { SubscriptionSettingRepositoryInterface } from '../../Setting/SubscriptionSettingRepositoryInterface'
import { UserSubscriptionServiceInterface } from '../../Subscription/UserSubscriptionServiceInterface'
import { SubscriptionSettingProjector } from '../../../Projection/SubscriptionSettingProjector'
import { SubscriptionSetting } from '../../Setting/SubscriptionSetting'
import { UserSubscription } from '../../Subscription/UserSubscription'
import { UserSubscriptionType } from '../../Subscription/UserSubscriptionType'

describe('GetSettings', () => {
  let settingRepository: SettingRepositoryInterface
  let subscriptionSettingRepository: SubscriptionSettingRepositoryInterface
  let userSubscriptionService: UserSubscriptionServiceInterface
  let settingProjector: SettingProjector
  let subscriptionSettingProjector: SubscriptionSettingProjector
  let setting: Setting
  let mfaSetting: Setting
  let signInEmailsSetting: SubscriptionSetting
  let userRepository: UserRepositoryInterface
  let user: User
  let crypter: CrypterInterface
  let regularSubscription: UserSubscription
  let sharedSubscription: UserSubscription

  const createUseCase = () =>
    new GetSettings(
      settingRepository,
      subscriptionSettingRepository,
      userSubscriptionService,
      settingProjector,
      subscriptionSettingProjector,
      userRepository,
      crypter,
    )

  beforeEach(() => {
    setting = new Setting()
    setting.name = 'test'
    setting.updatedAt = 345
    setting.sensitive = false

    mfaSetting = new Setting()
    mfaSetting.name = SettingName.NAMES.MfaSecret
    mfaSetting.updatedAt = 122
    mfaSetting.sensitive = true

    signInEmailsSetting = new SubscriptionSetting()
    signInEmailsSetting.name = SettingName.NAMES.MuteSignInEmails
    signInEmailsSetting.updatedAt = 122
    signInEmailsSetting.sensitive = false
    signInEmailsSetting.value = 'not_muted'

    settingRepository = {} as jest.Mocked<SettingRepositoryInterface>
    settingRepository.findAllByUserUuid = jest.fn().mockReturnValue([setting, mfaSetting])

    subscriptionSettingRepository = {} as jest.Mocked<SubscriptionSettingRepositoryInterface>
    subscriptionSettingRepository.findAllBySubscriptionUuid = jest.fn().mockReturnValue([signInEmailsSetting])

    regularSubscription = {
      uuid: '1-2-3',
      subscriptionType: UserSubscriptionType.Regular,
      user: Promise.resolve(user),
    } as jest.Mocked<UserSubscription>

    sharedSubscription = {
      uuid: '2-3-4',
      subscriptionType: UserSubscriptionType.Shared,
      user: Promise.resolve(user),
    } as jest.Mocked<UserSubscription>

    userSubscriptionService = {} as jest.Mocked<UserSubscriptionServiceInterface>
    userSubscriptionService.findRegularSubscriptionForUserUuid = jest
      .fn()
      .mockReturnValue({ regularSubscription: null, sharedSubscription: null })

    settingProjector = {} as jest.Mocked<SettingProjector>
    settingProjector.projectSimple = jest.fn().mockReturnValue({ foo: 'bar' })

    subscriptionSettingProjector = {} as jest.Mocked<SubscriptionSettingProjector>
    subscriptionSettingProjector.projectSimple = jest.fn().mockReturnValue({ foo: 'sub-bar' })

    user = {} as jest.Mocked<User>

    userRepository = {} as jest.Mocked<UserRepositoryInterface>
    userRepository.findOneByUuid = jest.fn().mockReturnValue(user)

    crypter = {} as jest.Mocked<CrypterInterface>
    crypter.decryptForUser = jest.fn().mockReturnValue('decrypted')
  })

  describe('no subscription', () => {
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

      expect(settingProjector.projectSimple).toHaveBeenCalledWith(setting)
      expect(subscriptionSettingProjector.projectSimple).not.toHaveBeenCalled()
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

      expect(settingProjector.projectSimple).toHaveBeenCalledWith({
        name: 'test',
        updatedAt: 345,
        value: 'decrypted',
        serverEncryptionVersion: 1,
      })
    })

    it('should return all user settings of certain name', async () => {
      expect(
        await createUseCase().execute({ userUuid: '1-2-3', settingName: 'test', allowSensitiveRetrieval: true }),
      ).toEqual({
        success: true,
        userUuid: '1-2-3',
        settings: [{ foo: 'bar' }],
      })

      expect(settingProjector.projectSimple).toHaveBeenCalledWith(setting)
    })

    it('should return all user settings updated after', async () => {
      expect(
        await createUseCase().execute({ userUuid: '1-2-3', allowSensitiveRetrieval: true, updatedAfter: 123 }),
      ).toEqual({
        success: true,
        userUuid: '1-2-3',
        settings: [{ foo: 'bar' }],
      })

      expect(settingProjector.projectSimple).toHaveBeenCalledWith(setting)
    })

    it('should return all sensitive user settings if explicit', async () => {
      expect(await createUseCase().execute({ userUuid: '1-2-3', allowSensitiveRetrieval: true })).toEqual({
        success: true,
        userUuid: '1-2-3',
        settings: [{ foo: 'bar' }, { foo: 'bar' }],
      })

      expect(settingProjector.projectSimple).toHaveBeenCalledTimes(2)
      expect(settingProjector.projectSimple).toHaveBeenNthCalledWith(1, setting)
      expect(settingProjector.projectSimple).toHaveBeenNthCalledWith(2, mfaSetting)
    })
  })

  describe('regular subscription', () => {
    beforeEach(() => {
      userSubscriptionService.findRegularSubscriptionForUserUuid = jest
        .fn()
        .mockReturnValue({ regularSubscription, sharedSubscription: null })
    })

    it('should return all user settings except mfa', async () => {
      expect(await createUseCase().execute({ userUuid: '1-2-3' })).toEqual({
        success: true,
        userUuid: '1-2-3',
        settings: [{ foo: 'bar' }, { foo: 'sub-bar' }],
      })

      expect(subscriptionSettingRepository.findAllBySubscriptionUuid).toHaveBeenCalledWith('1-2-3')
      expect(settingProjector.projectSimple).toHaveBeenCalledWith(setting)
      expect(subscriptionSettingProjector.projectSimple).toHaveBeenCalledWith(signInEmailsSetting)
    })
  })

  describe('shared subscription', () => {
    beforeEach(() => {
      userSubscriptionService.findRegularSubscriptionForUserUuid = jest
        .fn()
        .mockReturnValue({ regularSubscription, sharedSubscription })
    })

    it('should return all user settings except mfa', async () => {
      expect(await createUseCase().execute({ userUuid: '1-2-3' })).toEqual({
        success: true,
        userUuid: '1-2-3',
        settings: [{ foo: 'bar' }, { foo: 'sub-bar' }],
      })

      expect(subscriptionSettingRepository.findAllBySubscriptionUuid).toHaveBeenCalledWith('2-3-4')
      expect(settingProjector.projectSimple).toHaveBeenCalledWith(setting)
      expect(subscriptionSettingProjector.projectSimple).toHaveBeenCalledWith(signInEmailsSetting)
    })
  })
})
