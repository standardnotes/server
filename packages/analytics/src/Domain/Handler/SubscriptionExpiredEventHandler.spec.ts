import 'reflect-metadata'

import { SubscriptionName } from '@standardnotes/common'
import { SubscriptionExpiredEvent } from '@standardnotes/domain-events'

import { SubscriptionExpiredEventHandler } from './SubscriptionExpiredEventHandler'
import { GetUserAnalyticsId } from '../UseCase/GetUserAnalyticsId/GetUserAnalyticsId'
import { StatisticsStoreInterface } from '../Statistics/StatisticsStoreInterface'
import { AnalyticsStoreInterface } from '../Analytics/AnalyticsStoreInterface'

describe('SubscriptionExpiredEventHandler', () => {
  let event: SubscriptionExpiredEvent
  let getUserAnalyticsId: GetUserAnalyticsId
  let analyticsStore: AnalyticsStoreInterface
  let statisticsStore: StatisticsStoreInterface

  const createHandler = () => new SubscriptionExpiredEventHandler(getUserAnalyticsId, analyticsStore, statisticsStore)

  beforeEach(() => {
    event = {} as jest.Mocked<SubscriptionExpiredEvent>
    event.createdAt = new Date(1)
    event.payload = {
      subscriptionId: 1,
      userEmail: 'test@test.com',
      subscriptionName: SubscriptionName.PlusPlan,
      timestamp: 1,
      offline: false,
      totalActiveSubscriptionsCount: 123,
    }

    getUserAnalyticsId = {} as jest.Mocked<GetUserAnalyticsId>
    getUserAnalyticsId.execute = jest.fn().mockReturnValue({ analyticsId: 3 })

    analyticsStore = {} as jest.Mocked<AnalyticsStoreInterface>
    analyticsStore.markActivity = jest.fn()

    statisticsStore = {} as jest.Mocked<StatisticsStoreInterface>
    statisticsStore.setMeasure = jest.fn()
  })

  it('should update analytics and statistics', async () => {
    await createHandler().handle(event)

    expect(analyticsStore.markActivity).toHaveBeenCalled()
    expect(statisticsStore.setMeasure).toHaveBeenCalled()
  })
})
