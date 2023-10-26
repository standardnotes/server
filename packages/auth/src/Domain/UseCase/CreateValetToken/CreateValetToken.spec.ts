import 'reflect-metadata'

import { TimerInterface } from '@standardnotes/time'
import { TokenEncoderInterface, ValetTokenData, ValetTokenOperation } from '@standardnotes/security'

import { CreateValetToken } from './CreateValetToken'
import { UserSubscription } from '../../Subscription/UserSubscription'
import { User } from '../../User/User'
import { UserSubscriptionType } from '../../Subscription/UserSubscriptionType'
import { SubscriptionSettingsAssociationServiceInterface } from '../../Setting/SubscriptionSettingsAssociationServiceInterface'
import { GetRegularSubscriptionForUser } from '../GetRegularSubscriptionForUser/GetRegularSubscriptionForUser'
import { GetSubscriptionSetting } from '../GetSubscriptionSetting/GetSubscriptionSetting'
import { GetSharedSubscriptionForUser } from '../GetSharedSubscriptionForUser/GetSharedSubscriptionForUser'
import { Result, SettingName, Timestamps, Uuid } from '@standardnotes/domain-core'
import { EncryptionVersion } from '../../Encryption/EncryptionVersion'
import { SubscriptionSetting } from '../../Setting/SubscriptionSetting'

describe('CreateValetToken', () => {
  let tokenEncoder: TokenEncoderInterface<ValetTokenData>
  let getRegularSubscription: GetRegularSubscriptionForUser
  let subscriptionSettingsAssociationService: SubscriptionSettingsAssociationServiceInterface
  let getSharedSubscription: GetSharedSubscriptionForUser
  let getSubscriptionSetting: GetSubscriptionSetting
  let timer: TimerInterface
  const valetTokenTTL = 123
  let regularSubscription: UserSubscription
  let sharedSubscription: UserSubscription
  let user: User

  const createUseCase = () =>
    new CreateValetToken(
      tokenEncoder,
      subscriptionSettingsAssociationService,
      getRegularSubscription,
      getSharedSubscription,
      getSubscriptionSetting,
      timer,
      valetTokenTTL,
    )

  beforeEach(() => {
    tokenEncoder = {} as jest.Mocked<TokenEncoderInterface<ValetTokenData>>
    tokenEncoder.encodeExpirableToken = jest.fn().mockReturnValue('foobar')

    getSubscriptionSetting = {} as jest.Mocked<GetSubscriptionSetting>
    getSubscriptionSetting.execute = jest.fn().mockReturnValue(
      Result.ok({
        setting: SubscriptionSetting.create({
          sensitive: false,
          name: SettingName.NAMES.FileUploadBytesUsed,
          value: '123',
          timestamps: Timestamps.create(123456789, 123456789).getValue(),
          serverEncryptionVersion: EncryptionVersion.Unencrypted,
          userSubscriptionUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
        }).getValue(),
      }),
    )

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

    getRegularSubscription = {} as jest.Mocked<GetRegularSubscriptionForUser>
    getRegularSubscription.execute = jest.fn().mockReturnValue(Result.ok(regularSubscription))

    getSharedSubscription = {} as jest.Mocked<GetSharedSubscriptionForUser>
    getSharedSubscription.execute = jest.fn().mockReturnValue(Result.fail('not found'))

    timer = {} as jest.Mocked<TimerInterface>
    timer.getTimestampInMicroseconds = jest.fn().mockReturnValue(100)
  })

  it('should create a read valet token', async () => {
    const response = await createUseCase().execute({
      operation: ValetTokenOperation.Read,
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
    getRegularSubscription.execute = jest.fn().mockReturnValue(Result.fail('not found'))

    const response = await createUseCase().execute({
      operation: ValetTokenOperation.Read,
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
    getRegularSubscription.execute = jest.fn().mockReturnValue(Result.ok(regularSubscription))

    timer.getTimestampInMicroseconds = jest.fn().mockReturnValue(150)

    const response = await createUseCase().execute({
      operation: ValetTokenOperation.Read,
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
      operation: ValetTokenOperation.Write,
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
      operation: ValetTokenOperation.Write,
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
    getSharedSubscription.execute = jest.fn().mockReturnValue(Result.ok(sharedSubscription))

    const response = await createUseCase().execute({
      operation: ValetTokenOperation.Write,
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
    getRegularSubscription.execute = jest.fn().mockReturnValue(Result.fail('not found'))
    getSharedSubscription.execute = jest.fn().mockReturnValue(Result.ok(sharedSubscription))

    const response = await createUseCase().execute({
      operation: ValetTokenOperation.Write,
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
    getSubscriptionSetting.execute = jest.fn().mockReturnValue(Result.fail('not found'))

    const response = await createUseCase().execute({
      operation: ValetTokenOperation.Write,
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
