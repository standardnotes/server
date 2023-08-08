import { UpdateStorageQuotaUsedForUser } from './UpdateStorageQuotaUsedForUser'

import { SubscriptionSettingServiceInterface } from '../../Setting/SubscriptionSettingServiceInterface'
import { UserSubscription } from '../../Subscription/UserSubscription'
import { UserSubscriptionServiceInterface } from '../../Subscription/UserSubscriptionServiceInterface'
import { UserSubscriptionType } from '../../Subscription/UserSubscriptionType'
import { User } from '../../User/User'
import { UserRepositoryInterface } from '../../User/UserRepositoryInterface'

describe('UpdateStorageQuotaUsedForUser', () => {
  let userRepository: UserRepositoryInterface
  let userSubscriptionService: UserSubscriptionServiceInterface
  let user: User
  let subscriptionSettingService: SubscriptionSettingServiceInterface
  let regularSubscription: UserSubscription
  let sharedSubscription: UserSubscription

  const createUseCase = () =>
    new UpdateStorageQuotaUsedForUser(userRepository, userSubscriptionService, subscriptionSettingService)

  beforeEach(() => {
    user = {
      uuid: '123',
    } as jest.Mocked<User>

    userRepository = {} as jest.Mocked<UserRepositoryInterface>
    userRepository.findOneByUuid = jest.fn().mockReturnValue(user)

    regularSubscription = {
      uuid: '00000000-0000-0000-0000-000000000000',
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
      .mockReturnValue({ regularSubscription, sharedSubscription: null })

    subscriptionSettingService = {} as jest.Mocked<SubscriptionSettingServiceInterface>
    subscriptionSettingService.findSubscriptionSettingWithDecryptedValue = jest.fn().mockReturnValue(null)
    subscriptionSettingService.createOrReplace = jest.fn()
  })

  it('should create a bytes used setting if one does not exist', async () => {
    const result = await createUseCase().execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      bytesUsed: 123,
    })

    expect(result.isFailed()).toBeFalsy()
    expect(subscriptionSettingService.createOrReplace).toHaveBeenCalledWith({
      props: {
        name: 'FILE_UPLOAD_BYTES_USED',
        sensitive: false,
        unencryptedValue: '123',
        serverEncryptionVersion: 0,
      },
      user,
      userSubscription: {
        uuid: '00000000-0000-0000-0000-000000000000',
        subscriptionType: 'regular',
        user: Promise.resolve(user),
      },
    })
  })

  it('should not do anything if a user uuid is invalid', async () => {
    const result = await createUseCase().execute({
      userUuid: 'invalid',
      bytesUsed: 123,
    })
    expect(result.isFailed()).toBeTruthy()

    expect(subscriptionSettingService.createOrReplace).not.toHaveBeenCalled()
  })

  it('should not do anything if a user is not found', async () => {
    userRepository.findOneByUuid = jest.fn().mockReturnValue(null)

    const result = await createUseCase().execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      bytesUsed: 123,
    })
    expect(result.isFailed()).toBeTruthy()

    expect(subscriptionSettingService.createOrReplace).not.toHaveBeenCalled()
  })

  it('should not do anything if a user subscription is not found', async () => {
    subscriptionSettingService.findSubscriptionSettingWithDecryptedValue = jest.fn().mockReturnValue({
      value: 345,
    })
    userSubscriptionService.findRegularSubscriptionForUserUuid = jest
      .fn()
      .mockReturnValue({ regularSubscription: null, sharedSubscription: null })

    const result = await createUseCase().execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      bytesUsed: 123,
    })
    expect(result.isFailed()).toBeTruthy()

    expect(subscriptionSettingService.createOrReplace).not.toHaveBeenCalled()
  })

  it('should add bytes used setting if one does exist', async () => {
    subscriptionSettingService.findSubscriptionSettingWithDecryptedValue = jest.fn().mockReturnValue({
      value: 345,
    })
    const result = await createUseCase().execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      bytesUsed: 123,
    })
    expect(result.isFailed()).toBeFalsy()

    expect(subscriptionSettingService.createOrReplace).toHaveBeenCalledWith({
      props: {
        name: 'FILE_UPLOAD_BYTES_USED',
        sensitive: false,
        unencryptedValue: '468',
        serverEncryptionVersion: 0,
      },
      user,
      userSubscription: {
        uuid: '00000000-0000-0000-0000-000000000000',
        subscriptionType: 'regular',
        user: Promise.resolve(user),
      },
    })
  })

  it('should subtract bytes used setting if one does exist', async () => {
    subscriptionSettingService.findSubscriptionSettingWithDecryptedValue = jest.fn().mockReturnValue({
      value: 345,
    })
    const result = await createUseCase().execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      bytesUsed: -123,
    })
    expect(result.isFailed()).toBeFalsy()

    expect(subscriptionSettingService.createOrReplace).toHaveBeenCalledWith({
      props: {
        name: 'FILE_UPLOAD_BYTES_USED',
        sensitive: false,
        unencryptedValue: '222',
        serverEncryptionVersion: 0,
      },
      user,
      userSubscription: {
        uuid: '00000000-0000-0000-0000-000000000000',
        subscriptionType: 'regular',
        user: Promise.resolve(user),
      },
    })
  })

  it('should update a bytes used setting on both regular and shared subscription', async () => {
    userSubscriptionService.findRegularSubscriptionForUserUuid = jest
      .fn()
      .mockReturnValue({ regularSubscription, sharedSubscription })

    subscriptionSettingService.findSubscriptionSettingWithDecryptedValue = jest.fn().mockReturnValue({
      value: 345,
    })
    const result = await createUseCase().execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      bytesUsed: 123,
    })
    expect(result.isFailed()).toBeFalsy()

    expect(subscriptionSettingService.createOrReplace).toHaveBeenCalledWith({
      props: {
        name: 'FILE_UPLOAD_BYTES_USED',
        sensitive: false,
        unencryptedValue: '468',
        serverEncryptionVersion: 0,
      },
      user,
      userSubscription: {
        uuid: '00000000-0000-0000-0000-000000000000',
        subscriptionType: 'regular',
        user: Promise.resolve(user),
      },
    })

    expect(subscriptionSettingService.createOrReplace).toHaveBeenCalledWith({
      props: {
        name: 'FILE_UPLOAD_BYTES_USED',
        sensitive: false,
        unencryptedValue: '468',
        serverEncryptionVersion: 0,
      },
      user,
      userSubscription: {
        uuid: '2-3-4',
        subscriptionType: 'shared',
        user: Promise.resolve(user),
      },
    })
  })
})
