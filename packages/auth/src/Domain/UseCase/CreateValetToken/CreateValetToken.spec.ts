import 'reflect-metadata'

import { TokenEncoderInterface, ValetTokenData } from '@standardnotes/security'
import { CreateValetToken } from './CreateValetToken'
import { TimerInterface } from '@standardnotes/time'
import { UserSubscription } from '../../Subscription/UserSubscription'
import { SubscriptionSettingServiceInterface } from '../../Setting/SubscriptionSettingServiceInterface'
import { User } from '../../User/User'
import { UserSubscriptionType } from '../../Subscription/UserSubscriptionType'
import { SubscriptionSettingsAssociationServiceInterface } from '../../Setting/SubscriptionSettingsAssociationServiceInterface'
import { UserSubscriptionServiceInterface } from '../../Subscription/UserSubscriptionServiceInterface'

describe('CreateValetToken', () => {
  let tokenEncoder: TokenEncoderInterface<ValetTokenData>
  let subscriptionSettingService: SubscriptionSettingServiceInterface
  let subscriptionSettingsAssociationService: SubscriptionSettingsAssociationServiceInterface
  let userSubscriptionService: UserSubscriptionServiceInterface
  let timer: TimerInterface
  const valetTokenTTL = 123
  let regularSubscription: UserSubscription
  let sharedSubscription: UserSubscription
  let user: User

  const createUseCase = () =>
    new CreateValetToken(
      tokenEncoder,
      subscriptionSettingService,
      subscriptionSettingsAssociationService,
      userSubscriptionService,
      timer,
      valetTokenTTL,
    )

  beforeEach(() => {
    tokenEncoder = {} as jest.Mocked<TokenEncoderInterface<ValetTokenData>>
    tokenEncoder.encodeExpirableToken = jest.fn().mockReturnValue('foobar')

    subscriptionSettingService = {} as jest.Mocked<SubscriptionSettingServiceInterface>
    subscriptionSettingService.findSubscriptionSettingWithDecryptedValue = jest.fn().mockReturnValue({
      value: '123',
    })

    subscriptionSettingsAssociationService = {} as jest.Mocked<SubscriptionSettingsAssociationServiceInterface>
    subscriptionSettingsAssociationService.getFileUploadLimit = jest.fn().mockReturnValue(5_368_709_120)

    user = {
      uuid: '123',
    } as jest.Mocked<User>

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
      .mockReturnValue({ regularSubscription, sharedSubscription: null })

    timer = {} as jest.Mocked<TimerInterface>
    timer.getTimestampInMicroseconds = jest.fn().mockReturnValue(100)
  })

  it('should create a read valet token', async () => {
    const response = await createUseCase().execute({
      operation: 'read',
      userUuid: '1-2-3',
      resources: [
        {
          remoteIdentifier: '1-2-3/2-3-4',
          unencryptedFileSize: 123,
        },
      ],
    })

    expect(response).toEqual({
      success: true,
      valetToken: 'foobar',
    })
  })

  it('should not create a valet token if a user has no subscription', async () => {
    userSubscriptionService.findRegularSubscriptionForUserUuid = jest
      .fn()
      .mockReturnValue({ regularSubscription: null, sharedSubscription: null })

    const response = await createUseCase().execute({
      operation: 'read',
      userUuid: '1-2-3',
      resources: [
        {
          remoteIdentifier: '1-2-3/2-3-4',
          unencryptedFileSize: 123,
        },
      ],
    })

    expect(response).toEqual({
      success: false,
      reason: 'no-subscription',
    })
  })

  it('should not create a valet token if a user has an expired subscription', async () => {
    regularSubscription.endsAt = 1
    userSubscriptionService.findRegularSubscriptionForUserUuid = jest
      .fn()
      .mockReturnValue({ regularSubscription, sharedSubscription: null })

    timer.getTimestampInMicroseconds = jest.fn().mockReturnValue(150)

    const response = await createUseCase().execute({
      operation: 'read',
      userUuid: '1-2-3',
      resources: [
        {
          remoteIdentifier: '1-2-3/2-3-4',
          unencryptedFileSize: 123,
        },
      ],
    })

    expect(response).toEqual({
      success: false,
      reason: 'expired-subscription',
    })
  })

  it('should not create a write valet token if unencrypted file size has not been provided for a resource', async () => {
    const response = await createUseCase().execute({
      operation: 'write',
      resources: [
        {
          remoteIdentifier: '2-3-4',
        },
      ],
      userUuid: '1-2-3',
    })

    expect(response).toEqual({
      success: false,
      reason: 'invalid-parameters',
    })
  })

  it('should create a write valet token', async () => {
    const response = await createUseCase().execute({
      operation: 'write',
      resources: [
        {
          remoteIdentifier: '2-3-4',
          unencryptedFileSize: 123,
        },
      ],
      userUuid: '1-2-3',
    })

    expect(tokenEncoder.encodeExpirableToken).toHaveBeenCalledWith(
      {
        sharedSubscriptionUuid: undefined,
        regularSubscriptionUuid: '1-2-3',
        permittedOperation: 'write',
        permittedResources: [
          {
            remoteIdentifier: '2-3-4',
            unencryptedFileSize: 123,
          },
        ],
        userUuid: '1-2-3',
        uploadBytesUsed: 123,
        uploadBytesLimit: 123,
      },
      123,
    )

    expect(response).toEqual({
      success: true,
      valetToken: 'foobar',
    })
  })

  it('should create a write valet token for shared subscription', async () => {
    userSubscriptionService.findRegularSubscriptionForUserUuid = jest
      .fn()
      .mockReturnValue({ regularSubscription, sharedSubscription })

    const response = await createUseCase().execute({
      operation: 'write',
      resources: [
        {
          remoteIdentifier: '2-3-4',
          unencryptedFileSize: 123,
        },
      ],
      userUuid: '1-2-3',
    })

    expect(tokenEncoder.encodeExpirableToken).toHaveBeenCalledWith(
      {
        sharedSubscriptionUuid: '2-3-4',
        regularSubscriptionUuid: '1-2-3',
        permittedOperation: 'write',
        permittedResources: [
          {
            remoteIdentifier: '2-3-4',
            unencryptedFileSize: 123,
          },
        ],
        userUuid: '1-2-3',
        uploadBytesUsed: 123,
        uploadBytesLimit: 123,
      },
      123,
    )

    expect(response).toEqual({
      success: true,
      valetToken: 'foobar',
    })
  })

  it('should not create a write valet token for shared subscription if regular subscription could not be found', async () => {
    userSubscriptionService.findRegularSubscriptionForUserUuid = jest
      .fn()
      .mockReturnValue({ regularSubscription: null, sharedSubscription })

    const response = await createUseCase().execute({
      operation: 'write',
      resources: [
        {
          remoteIdentifier: '2-3-4',
          unencryptedFileSize: 123,
        },
      ],
      userUuid: '1-2-3',
    })

    expect(response).toEqual({
      success: false,
      reason: 'no-subscription',
    })
  })

  it('should create a write valet token with default subscription upload limit if upload bytes settings do not exist', async () => {
    subscriptionSettingService.findSubscriptionSettingWithDecryptedValue = jest.fn().mockReturnValue(null)

    const response = await createUseCase().execute({
      operation: 'write',
      userUuid: '1-2-3',
      resources: [
        {
          remoteIdentifier: '2-3-4',
          unencryptedFileSize: 123,
        },
      ],
    })

    expect(tokenEncoder.encodeExpirableToken).toHaveBeenCalledWith(
      {
        sharedSubscriptionUuid: undefined,
        regularSubscriptionUuid: '1-2-3',
        permittedOperation: 'write',
        permittedResources: [
          {
            remoteIdentifier: '2-3-4',
            unencryptedFileSize: 123,
          },
        ],
        userUuid: '1-2-3',
        uploadBytesUsed: 0,
        uploadBytesLimit: 5368709120,
      },
      123,
    )

    expect(response).toEqual({
      success: true,
      valetToken: 'foobar',
    })
  })
})
