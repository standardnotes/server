import { UpdateStorageQuotaUsedForUser } from './UpdateStorageQuotaUsedForUser'

import { UserSubscription } from '../../Subscription/UserSubscription'
import { UserSubscriptionType } from '../../Subscription/UserSubscriptionType'
import { User } from '../../User/User'
import { UserRepositoryInterface } from '../../User/UserRepositoryInterface'
import { GetSharedSubscriptionForUser } from '../GetSharedSubscriptionForUser/GetSharedSubscriptionForUser'
import { GetRegularSubscriptionForUser } from '../GetRegularSubscriptionForUser/GetRegularSubscriptionForUser'
import { Logger } from 'winston'
import { Result, SettingName } from '@standardnotes/domain-core'
import { TimerInterface } from '@standardnotes/time'
import { SubscriptionSettingRepositoryInterface } from '../../Setting/SubscriptionSettingRepositoryInterface'

describe('UpdateStorageQuotaUsedForUser', () => {
  let userRepository: UserRepositoryInterface
  let user: User
  let regularSubscription: UserSubscription
  let sharedSubscription: UserSubscription
  let getSharedSubscription: GetSharedSubscriptionForUser
  let getRegularSubscription: GetRegularSubscriptionForUser
  let subscriptionSettingRepository: SubscriptionSettingRepositoryInterface
  let timer: TimerInterface
  let logger: Logger

  const regularSubscriptionUuid = '00000000-0000-0000-0000-000000000000'
  const sharedSubscriptionUuid = '11111111-1111-1111-1111-111111111111'

  const createUseCase = () =>
    new UpdateStorageQuotaUsedForUser(
      userRepository,
      getRegularSubscription,
      getSharedSubscription,
      subscriptionSettingRepository,
      timer,
      logger,
    )

  beforeEach(() => {
    user = {
      uuid: '123',
    } as jest.Mocked<User>

    userRepository = {} as jest.Mocked<UserRepositoryInterface>
    userRepository.findOneByUuid = jest.fn().mockReturnValue(user)

    regularSubscription = {
      uuid: regularSubscriptionUuid,
      subscriptionType: UserSubscriptionType.Regular,
      userUuid: '123',
    } as jest.Mocked<UserSubscription>

    sharedSubscription = {
      uuid: sharedSubscriptionUuid,
      subscriptionType: UserSubscriptionType.Shared,
      userUuid: '123',
    } as jest.Mocked<UserSubscription>

    getSharedSubscription = {} as jest.Mocked<GetSharedSubscriptionForUser>
    getSharedSubscription.execute = jest.fn().mockReturnValue(Result.ok(sharedSubscription))

    getRegularSubscription = {} as jest.Mocked<GetRegularSubscriptionForUser>
    getRegularSubscription.execute = jest.fn().mockReturnValue(Result.ok(regularSubscription))

    subscriptionSettingRepository = {} as jest.Mocked<SubscriptionSettingRepositoryInterface>
    subscriptionSettingRepository.incrementCounterValueForNameAndUserSubscriptionUuid = jest
      .fn()
      .mockResolvedValue(undefined)

    timer = {} as jest.Mocked<TimerInterface>
    timer.getTimestampInMicroseconds = jest.fn().mockReturnValue(123)

    logger = {} as jest.Mocked<Logger>
    logger.error = jest.fn()
  })

  it('should atomically add the bytes used delta for the subscription', async () => {
    const result = await createUseCase().execute({
      userUuid: regularSubscriptionUuid,
      bytesUsed: 123,
    })

    expect(result.isFailed()).toBeFalsy()

    expect(
      subscriptionSettingRepository.incrementCounterValueForNameAndUserSubscriptionUuid,
    ).toHaveBeenCalledWith(SettingName.NAMES.FileUploadBytesUsed, expect.objectContaining({ value: regularSubscriptionUuid }), 123, 123)
  })

  it('should atomically subtract the bytes used delta for the subscription', async () => {
    const result = await createUseCase().execute({
      userUuid: regularSubscriptionUuid,
      bytesUsed: -123,
    })

    expect(result.isFailed()).toBeFalsy()

    expect(
      subscriptionSettingRepository.incrementCounterValueForNameAndUserSubscriptionUuid,
    ).toHaveBeenCalledWith(SettingName.NAMES.FileUploadBytesUsed, expect.objectContaining({ value: regularSubscriptionUuid }), -123, 123)
  })

  it('should update the bytes used on both the regular and shared subscription', async () => {
    const result = await createUseCase().execute({
      userUuid: regularSubscriptionUuid,
      bytesUsed: 123,
    })

    expect(result.isFailed()).toBeFalsy()

    expect(
      subscriptionSettingRepository.incrementCounterValueForNameAndUserSubscriptionUuid,
    ).toHaveBeenCalledWith(SettingName.NAMES.FileUploadBytesUsed, expect.objectContaining({ value: sharedSubscriptionUuid }), 123, 123)
    expect(
      subscriptionSettingRepository.incrementCounterValueForNameAndUserSubscriptionUuid,
    ).toHaveBeenCalledWith(SettingName.NAMES.FileUploadBytesUsed, expect.objectContaining({ value: regularSubscriptionUuid }), 123, 123)
    expect(subscriptionSettingRepository.incrementCounterValueForNameAndUserSubscriptionUuid).toHaveBeenCalledTimes(2)
  })

  it('should update only the regular subscription when there is no shared subscription', async () => {
    getSharedSubscription.execute = jest.fn().mockReturnValue(Result.fail('no shared subscription'))

    const result = await createUseCase().execute({
      userUuid: regularSubscriptionUuid,
      bytesUsed: 123,
    })

    expect(result.isFailed()).toBeFalsy()
    expect(subscriptionSettingRepository.incrementCounterValueForNameAndUserSubscriptionUuid).toHaveBeenCalledTimes(1)
  })

  it('should not do anything if a user uuid is invalid', async () => {
    const result = await createUseCase().execute({
      userUuid: 'invalid',
      bytesUsed: 123,
    })
    expect(result.isFailed()).toBeTruthy()

    expect(subscriptionSettingRepository.incrementCounterValueForNameAndUserSubscriptionUuid).not.toHaveBeenCalled()
  })

  it('should not do anything if a user is not found', async () => {
    userRepository.findOneByUuid = jest.fn().mockReturnValue(null)

    const result = await createUseCase().execute({
      userUuid: regularSubscriptionUuid,
      bytesUsed: 123,
    })
    expect(result.isFailed()).toBeTruthy()

    expect(subscriptionSettingRepository.incrementCounterValueForNameAndUserSubscriptionUuid).not.toHaveBeenCalled()
  })

  it('should not do anything if a user subscription is not found', async () => {
    getRegularSubscription.execute = jest.fn().mockReturnValue(Result.fail('error'))
    getSharedSubscription.execute = jest.fn().mockReturnValue(Result.fail('error'))

    const result = await createUseCase().execute({
      userUuid: regularSubscriptionUuid,
      bytesUsed: 123,
    })
    expect(result.isFailed()).toBeTruthy()

    expect(subscriptionSettingRepository.incrementCounterValueForNameAndUserSubscriptionUuid).not.toHaveBeenCalled()
  })

  it('should log an error and skip the update if a subscription has an invalid uuid', async () => {
    getSharedSubscription.execute = jest.fn().mockReturnValue(Result.fail('no shared subscription'))
    regularSubscription.uuid = 'invalid-subscription-uuid'

    const result = await createUseCase().execute({
      userUuid: regularSubscriptionUuid,
      bytesUsed: 123,
    })

    expect(result.isFailed()).toBeFalsy()
    expect(logger.error).toHaveBeenCalled()
    expect(subscriptionSettingRepository.incrementCounterValueForNameAndUserSubscriptionUuid).not.toHaveBeenCalled()
  })
})
