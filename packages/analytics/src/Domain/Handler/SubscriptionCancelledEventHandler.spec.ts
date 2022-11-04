import 'reflect-metadata'

import { SubscriptionName } from '@standardnotes/common'
import { SubscriptionCancelledEvent } from '@standardnotes/domain-events'

import { SubscriptionCancelledEventHandler } from './SubscriptionCancelledEventHandler'
import { GetUserAnalyticsId } from '../UseCase/GetUserAnalyticsId/GetUserAnalyticsId'
import { AnalyticsStoreInterface } from '../Analytics/AnalyticsStoreInterface'
import { StatisticsMeasure } from '../Statistics/StatisticsMeasure'
import { StatisticsStoreInterface } from '../Statistics/StatisticsStoreInterface'
import { Period } from '../Time/Period'

describe('SubscriptionCancelledEventHandler', () => {
  let event: SubscriptionCancelledEvent
  let getUserAnalyticsId: GetUserAnalyticsId
  let analyticsStore: AnalyticsStoreInterface
  let statisticsStore: StatisticsStoreInterface

  const createHandler = () => new SubscriptionCancelledEventHandler(getUserAnalyticsId, analyticsStore, statisticsStore)

  beforeEach(() => {
    getUserAnalyticsId = {} as jest.Mocked<GetUserAnalyticsId>
    getUserAnalyticsId.execute = jest.fn().mockReturnValue({ analyticsId: 3 })

    analyticsStore = {} as jest.Mocked<AnalyticsStoreInterface>
    analyticsStore.markActivity = jest.fn()

    statisticsStore = {} as jest.Mocked<StatisticsStoreInterface>
    statisticsStore.incrementMeasure = jest.fn()

    event = {} as jest.Mocked<SubscriptionCancelledEvent>
    event.createdAt = new Date(1)
    event.payload = {
      subscriptionId: 1,
      userEmail: 'test@test.com',
      subscriptionName: SubscriptionName.ProPlan,
      subscriptionCreatedAt: 1642395451515000,
      subscriptionUpdatedAt: 1642395451515001,
      lastPayedAt: 1642395451515001,
      subscriptionEndsAt: 1642395451515000 + 10,
      timestamp: 1,
      offline: false,
      replaced: false,
    }
  })

  it('should track subscription cancelled statistics', async () => {
    event.payload.timestamp = 1642395451516000

    await createHandler().handle(event)

    expect(analyticsStore.markActivity).toHaveBeenCalled()
    expect(statisticsStore.incrementMeasure).toHaveBeenCalledWith(StatisticsMeasure.SubscriptionLength, 1000, [
      Period.Today,
      Period.ThisWeek,
      Period.ThisMonth,
    ])
  })

  it('should not track statistics for subscriptions that are in a legacy 5 year plan', async () => {
    event.payload.timestamp = 1642395451516000
    event.payload.subscriptionEndsAt = 1642395451515000 + 126_230_400_000_001
    event.payload.subscriptionCreatedAt = 1642395451515000

    await createHandler().handle(event)

    expect(statisticsStore.incrementMeasure).not.toHaveBeenCalled()
  })
})
