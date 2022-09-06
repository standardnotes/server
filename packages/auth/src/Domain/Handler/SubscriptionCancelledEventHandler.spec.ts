import 'reflect-metadata'

import { SubscriptionName } from '@standardnotes/common'
import { SubscriptionCancelledEvent } from '@standardnotes/domain-events'

import * as dayjs from 'dayjs'

import { SubscriptionCancelledEventHandler } from './SubscriptionCancelledEventHandler'
import { UserSubscriptionRepositoryInterface } from '../Subscription/UserSubscriptionRepositoryInterface'
import { OfflineUserSubscriptionRepositoryInterface } from '../Subscription/OfflineUserSubscriptionRepositoryInterface'
import { AnalyticsStoreInterface, Period, StatisticsMeasure, StatisticsStoreInterface } from '@standardnotes/analytics'
import { GetUserAnalyticsId } from '../UseCase/GetUserAnalyticsId/GetUserAnalyticsId'
import { UserRepositoryInterface } from '../User/UserRepositoryInterface'
import { User } from '../User/User'
import { UserSubscription } from '../Subscription/UserSubscription'
import { Logger } from 'winston'

describe('SubscriptionCancelledEventHandler', () => {
  let userSubscriptionRepository: UserSubscriptionRepositoryInterface
  let offlineUserSubscriptionRepository: OfflineUserSubscriptionRepositoryInterface
  let event: SubscriptionCancelledEvent
  let userRepository: UserRepositoryInterface
  let getUserAnalyticsId: GetUserAnalyticsId
  let analyticsStore: AnalyticsStoreInterface
  let statisticsStore: StatisticsStoreInterface
  let timestamp: number
  let logger: Logger

  const createHandler = () =>
    new SubscriptionCancelledEventHandler(
      userSubscriptionRepository,
      offlineUserSubscriptionRepository,
      userRepository,
      getUserAnalyticsId,
      analyticsStore,
      statisticsStore,
      logger,
    )

  beforeEach(() => {
    const user = { uuid: '1-2-3' } as jest.Mocked<User>

    userRepository = {} as jest.Mocked<UserRepositoryInterface>
    userRepository.findOneByEmail = jest.fn().mockReturnValue(user)

    getUserAnalyticsId = {} as jest.Mocked<GetUserAnalyticsId>
    getUserAnalyticsId.execute = jest.fn().mockReturnValue({ analyticsId: 3 })

    analyticsStore = {} as jest.Mocked<AnalyticsStoreInterface>
    analyticsStore.markActivity = jest.fn()

    statisticsStore = {} as jest.Mocked<StatisticsStoreInterface>
    statisticsStore.incrementMeasure = jest.fn()

    const userSubscription = {
      createdAt: 1642395451515000,
    } as jest.Mocked<UserSubscription>

    userSubscriptionRepository = {} as jest.Mocked<UserSubscriptionRepositoryInterface>
    userSubscriptionRepository.updateCancelled = jest.fn()
    userSubscriptionRepository.findBySubscriptionId = jest.fn().mockReturnValue([userSubscription])

    offlineUserSubscriptionRepository = {} as jest.Mocked<OfflineUserSubscriptionRepositoryInterface>
    offlineUserSubscriptionRepository.updateCancelled = jest.fn()

    timestamp = dayjs.utc().valueOf()

    event = {} as jest.Mocked<SubscriptionCancelledEvent>
    event.createdAt = new Date(1)
    event.payload = {
      subscriptionId: 1,
      userEmail: 'test@test.com',
      subscriptionName: SubscriptionName.ProPlan,
      timestamp,
      offline: false,
      replaced: false,
    }

    logger = {} as jest.Mocked<Logger>
    logger.info = jest.fn()
  })

  it('should update subscription cancelled', async () => {
    event.payload.timestamp = 1642395451516000
    await createHandler().handle(event)

    expect(userSubscriptionRepository.updateCancelled).toHaveBeenCalledWith(1, true, 1642395451516000)
    expect(analyticsStore.markActivity).toHaveBeenCalled()
    expect(statisticsStore.incrementMeasure).toHaveBeenCalledWith(StatisticsMeasure.SubscriptionLength, 1000, [
      Period.Today,
      Period.ThisWeek,
      Period.ThisMonth,
    ])
  })

  it('should update subscription cancelled - user not found', async () => {
    userRepository.findOneByEmail = jest.fn().mockReturnValue(null)

    await createHandler().handle(event)

    expect(userSubscriptionRepository.updateCancelled).toHaveBeenCalledWith(1, true, timestamp)
    expect(analyticsStore.markActivity).not.toHaveBeenCalled()
  })

  it('should update offline subscription cancelled', async () => {
    event.payload.offline = true

    await createHandler().handle(event)

    expect(offlineUserSubscriptionRepository.updateCancelled).toHaveBeenCalledWith(1, true, timestamp)
  })
})
