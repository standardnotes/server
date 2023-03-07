import 'reflect-metadata'

import { SettingName } from '@standardnotes/settings'

import { SubscriptionSettingProjector } from '../../../Projection/SubscriptionSettingProjector'
import { SubscriptionSetting } from '../../Setting/SubscriptionSetting'
import { SubscriptionSettingServiceInterface } from '../../Setting/SubscriptionSettingServiceInterface'
import { UserSubscriptionServiceInterface } from '../../Subscription/UserSubscriptionServiceInterface'

import { GetSubscriptionSetting } from './GetSubscriptionSetting'
import { UserSubscription } from '../../Subscription/UserSubscription'
import { UserSubscriptionType } from '../../Subscription/UserSubscriptionType'
import { User } from '../../User/User'

describe('GetSubscriptionSetting', () => {
  let userSubscriptionService: UserSubscriptionServiceInterface
  let subscriptionSettingService: SubscriptionSettingServiceInterface
  let subscriptionSettingProjector: SubscriptionSettingProjector
  let subscriptionSetting: SubscriptionSetting
  let regularSubscription: UserSubscription
  let user: User

  const createUseCase = () =>
    new GetSubscriptionSetting(userSubscriptionService, subscriptionSettingService, subscriptionSettingProjector)

  beforeEach(() => {
    subscriptionSetting = {} as jest.Mocked<SubscriptionSetting>

    user = {
      uuid: '1-2-3',
    } as jest.Mocked<User>

    regularSubscription = {
      uuid: '1-2-3',
      subscriptionType: UserSubscriptionType.Regular,
      user: Promise.resolve(user),
    } as jest.Mocked<UserSubscription>

    userSubscriptionService = {} as jest.Mocked<UserSubscriptionServiceInterface>
    userSubscriptionService.findRegularSubscriptionForUserUuid = jest
      .fn()
      .mockReturnValue({ regularSubscription, sharedSubscription: null })

    subscriptionSettingService = {} as jest.Mocked<SubscriptionSettingServiceInterface>
    subscriptionSettingService.findSubscriptionSettingWithDecryptedValue = jest
      .fn()
      .mockReturnValue(subscriptionSetting)

    subscriptionSettingProjector = {} as jest.Mocked<SubscriptionSettingProjector>
    subscriptionSettingProjector.projectSimple = jest.fn().mockReturnValue({ foo: 'bar' })
  })

  it('should find a setting for user', async () => {
    expect(
      await createUseCase().execute({
        userUuid: '1-2-3',
        subscriptionSettingName: SettingName.NAMES.FileUploadBytesUsed,
      }),
    ).toEqual({
      success: true,
      setting: { foo: 'bar' },
    })
  })

  it('should not find a setting if the setting name is invalid', async () => {
    expect(
      await createUseCase().execute({
        userUuid: '1-2-3',
        subscriptionSettingName: 'invalid',
      }),
    ).toEqual({
      success: false,
      error: {
        message: 'Invalid setting name: invalid',
      },
    })
  })

  it('should not get a setting for user if user has no corresponding regular subscription', async () => {
    userSubscriptionService.findRegularSubscriptionForUserUuid = jest
      .fn()
      .mockReturnValue({ regularSubscription: null, sharedSubscription: null })

    expect(
      await createUseCase().execute({
        userUuid: '1-2-3',
        subscriptionSettingName: SettingName.NAMES.FileUploadBytesLimit,
      }),
    ).toEqual({
      success: false,
      error: {
        message: 'No subscription found.',
      },
    })
  })

  it('should not get a setting for user if it does not exist', async () => {
    subscriptionSettingService.findSubscriptionSettingWithDecryptedValue = jest.fn().mockReturnValue(null)

    expect(
      await createUseCase().execute({
        userUuid: '1-2-3',
        subscriptionSettingName: SettingName.NAMES.FileUploadBytesLimit,
      }),
    ).toEqual({
      success: false,
      error: {
        message: 'Setting FILE_UPLOAD_BYTES_LIMIT for user 1-2-3 not found!',
      },
    })
  })

  it('should not retrieve a sensitive setting for user', async () => {
    subscriptionSetting = {
      sensitive: true,
      name: SettingName.NAMES.FileUploadBytesLimit,
    } as jest.Mocked<SubscriptionSetting>

    subscriptionSettingService.findSubscriptionSettingWithDecryptedValue = jest
      .fn()
      .mockReturnValue(subscriptionSetting)

    expect(
      await createUseCase().execute({
        userUuid: '1-2-3',
        subscriptionSettingName: SettingName.NAMES.FileUploadBytesLimit,
      }),
    ).toEqual({
      success: true,
      sensitive: true,
    })
  })

  it('should retrieve a sensitive setting for user if explicitly told to', async () => {
    subscriptionSetting = {
      sensitive: true,
      name: SettingName.NAMES.FileUploadBytesLimit,
    } as jest.Mocked<SubscriptionSetting>

    subscriptionSettingService.findSubscriptionSettingWithDecryptedValue = jest
      .fn()
      .mockReturnValue(subscriptionSetting)

    expect(
      await createUseCase().execute({
        userUuid: '1-2-3',
        subscriptionSettingName: SettingName.NAMES.FileUploadBytesLimit,
        allowSensitiveRetrieval: true,
      }),
    ).toEqual({
      success: true,
      setting: { foo: 'bar' },
    })
  })
})
