import 'reflect-metadata'

import { RoleName, SubscriptionName } from '@standardnotes/common'
import { SubscriptionPurchasedEvent } from '@standardnotes/domain-events'
import { Logger } from 'winston'

import * as dayjs from 'dayjs'

import { RoleServiceInterface } from '../Role/RoleServiceInterface'
import { User } from '../User/User'
import { UserRepositoryInterface } from '../User/UserRepositoryInterface'
import { UserSubscriptionRepositoryInterface } from '../Subscription/UserSubscriptionRepositoryInterface'
import { SubscriptionPurchasedEventHandler } from './SubscriptionPurchasedEventHandler'
import { UserSubscription } from '../Subscription/UserSubscription'
import { OfflineUserSubscriptionRepositoryInterface } from '../Subscription/OfflineUserSubscriptionRepositoryInterface'
import { OfflineUserSubscription } from '../Subscription/OfflineUserSubscription'
import { SubscriptionSettingServiceInterface } from '../Setting/SubscriptionSettingServiceInterface'
import { UserSubscriptionType } from '../Subscription/UserSubscriptionType'
import { AnalyticsStoreInterface, Period, StatisticsStoreInterface } from '@standardnotes/analytics'
import { AnalyticsEntity } from '../Analytics/AnalyticsEntity'
import { GetUserAnalyticsId } from '../UseCase/GetUserAnalyticsId/GetUserAnalyticsId'
import { TimerInterface } from '@standardnotes/time'

describe('SubscriptionPurchasedEventHandler', () => {
  let userRepository: UserRepositoryInterface
  let userSubscriptionRepository: UserSubscriptionRepositoryInterface
  let offlineUserSubscription: OfflineUserSubscription
  let offlineUserSubscriptionRepository: OfflineUserSubscriptionRepositoryInterface
  let roleService: RoleServiceInterface
  let logger: Logger
  let user: User
  let subscription: UserSubscription
  let event: SubscriptionPurchasedEvent
  let subscriptionExpiresAt: number
  let subscriptionSettingService: SubscriptionSettingServiceInterface
  let getUserAnalyticsId: GetUserAnalyticsId
  let analyticsStore: AnalyticsStoreInterface
  let timestamp: number
  let statisticsStore: StatisticsStoreInterface
  let timer: TimerInterface

  const createHandler = () =>
    new SubscriptionPurchasedEventHandler(
      userRepository,
      userSubscriptionRepository,
      offlineUserSubscriptionRepository,
      roleService,
      subscriptionSettingService,
      getUserAnalyticsId,
      analyticsStore,
      statisticsStore,
      timer,
      logger,
    )

  beforeEach(() => {
    user = {
      uuid: '123',
      email: 'test@test.com',
      roles: Promise.resolve([
        {
          name: RoleName.CoreUser,
        },
      ]),
    } as jest.Mocked<User>
    subscription = {
      subscriptionType: UserSubscriptionType.Regular,
    } as jest.Mocked<UserSubscription>

    userRepository = {} as jest.Mocked<UserRepositoryInterface>
    userRepository.findOneByEmail = jest.fn().mockReturnValue(user)
    userRepository.save = jest.fn().mockReturnValue(user)

    statisticsStore = {} as jest.Mocked<StatisticsStoreInterface>
    statisticsStore.incrementMeasure = jest.fn()

    timer = {} as jest.Mocked<TimerInterface>
    timer.convertDateToMicroseconds = jest.fn().mockReturnValue(1)

    userSubscriptionRepository = {} as jest.Mocked<UserSubscriptionRepositoryInterface>
    userSubscriptionRepository.countByUserUuid = jest.fn().mockReturnValue(0)
    userSubscriptionRepository.save = jest.fn().mockReturnValue(subscription)

    offlineUserSubscription = {} as jest.Mocked<OfflineUserSubscription>

    offlineUserSubscriptionRepository = {} as jest.Mocked<OfflineUserSubscriptionRepositoryInterface>
    offlineUserSubscriptionRepository.findOneBySubscriptionId = jest.fn().mockReturnValue(offlineUserSubscription)
    offlineUserSubscriptionRepository.save = jest.fn().mockReturnValue(offlineUserSubscription)

    roleService = {} as jest.Mocked<RoleServiceInterface>
    roleService.addUserRole = jest.fn()
    roleService.setOfflineUserRole = jest.fn()

    subscriptionExpiresAt = timestamp + 365 * 1000

    event = {} as jest.Mocked<SubscriptionPurchasedEvent>
    event.createdAt = new Date(1)
    event.payload = {
      subscriptionId: 1,
      userEmail: 'test@test.com',
      subscriptionName: SubscriptionName.ProPlan,
      subscriptionExpiresAt,
      timestamp: dayjs.utc().valueOf(),
      offline: false,
      discountCode: null,
    }

    subscriptionSettingService = {} as jest.Mocked<SubscriptionSettingServiceInterface>
    subscriptionSettingService.applyDefaultSubscriptionSettingsForSubscription = jest.fn()

    getUserAnalyticsId = {} as jest.Mocked<GetUserAnalyticsId>
    getUserAnalyticsId.execute = jest.fn().mockReturnValue({ analyticsId: 3 })

    analyticsStore = {} as jest.Mocked<AnalyticsStoreInterface>
    analyticsStore.markActivity = jest.fn()

    logger = {} as jest.Mocked<Logger>
    logger.info = jest.fn()
    logger.warn = jest.fn()
  })

  it('should update the user role', async () => {
    await createHandler().handle(event)

    expect(userRepository.findOneByEmail).toHaveBeenCalledWith('test@test.com')
    expect(roleService.addUserRole).toHaveBeenCalledWith(user, SubscriptionName.ProPlan)
  })

  it('should update user default settings', async () => {
    await createHandler().handle(event)

    expect(subscriptionSettingService.applyDefaultSubscriptionSettingsForSubscription).toHaveBeenCalledWith(
      subscription,
      SubscriptionName.ProPlan,
      '123',
    )
  })

  it('should update the offline user role', async () => {
    event.payload.offline = true

    await createHandler().handle(event)

    expect(roleService.setOfflineUserRole).toHaveBeenCalledWith(offlineUserSubscription)
  })

  it('should create subscription', async () => {
    await createHandler().handle(event)

    subscription.planName = SubscriptionName.ProPlan
    subscription.endsAt = subscriptionExpiresAt
    subscription.subscriptionId = 1
    subscription.user = Promise.resolve(user)

    expect(userRepository.findOneByEmail).toHaveBeenCalledWith('test@test.com')
    expect(userSubscriptionRepository.save).toHaveBeenCalledWith({
      ...subscription,
      createdAt: expect.any(Number),
      updatedAt: expect.any(Number),
      cancelled: false,
    })
    expect(statisticsStore.incrementMeasure).toHaveBeenCalled()
  })

  it("should not measure registration to subscription time if this is not user's first subscription", async () => {
    userSubscriptionRepository.countByUserUuid = jest.fn().mockReturnValue(1)

    await createHandler().handle(event)

    expect(statisticsStore.incrementMeasure).not.toHaveBeenCalled()
  })

  it('should update analytics on limited discount offer purchasing', async () => {
    const analyticsEntity = { id: 3 } as jest.Mocked<AnalyticsEntity>

    user = {
      uuid: '123',
      email: 'test@test.com',
      roles: Promise.resolve([
        {
          name: RoleName.CoreUser,
        },
      ]),
      analyticsEntity: Promise.resolve(analyticsEntity),
    } as jest.Mocked<User>
    userRepository.findOneByEmail = jest.fn().mockReturnValue(user)

    event.payload.discountCode = 'limited-10'

    await createHandler().handle(event)

    expect(analyticsStore.markActivity).toHaveBeenCalledWith(['limited-discount-offer-purchased'], 3, [Period.Today])
  })

  it('should create an offline subscription', async () => {
    event.payload.offline = true

    await createHandler().handle(event)

    expect(offlineUserSubscriptionRepository.save).toHaveBeenCalledWith({
      endsAt: subscriptionExpiresAt,
      subscriptionId: 1,
      planName: 'PRO_PLAN',
      email: 'test@test.com',
      createdAt: expect.any(Number),
      updatedAt: expect.any(Number),
      cancelled: false,
    })
  })

  it('should not do anything if no user is found for specified email', async () => {
    userRepository.findOneByEmail = jest.fn().mockReturnValue(null)

    await createHandler().handle(event)

    expect(roleService.addUserRole).not.toHaveBeenCalled()
    expect(userSubscriptionRepository.save).not.toHaveBeenCalled()
  })
})
