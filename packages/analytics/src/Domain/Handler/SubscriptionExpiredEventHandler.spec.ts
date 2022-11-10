import 'reflect-metadata'

import { SubscriptionName } from '@standardnotes/common'
import { SubscriptionExpiredEvent } from '@standardnotes/domain-events'

import { SubscriptionExpiredEventHandler } from './SubscriptionExpiredEventHandler'
import { GetUserAnalyticsId } from '../UseCase/GetUserAnalyticsId/GetUserAnalyticsId'
import { StatisticsStoreInterface } from '../Statistics/StatisticsStoreInterface'
import { AnalyticsStoreInterface } from '../Analytics/AnalyticsStoreInterface'
import { SaveRevenueModification } from '../UseCase/SaveRevenueModification/SaveRevenueModification'
import { Result } from '../Core/Result'
import { RevenueModification } from '../Revenue/RevenueModification'
import { Logger } from 'winston'

describe('SubscriptionExpiredEventHandler', () => {
  let event: SubscriptionExpiredEvent
  let getUserAnalyticsId: GetUserAnalyticsId
  let analyticsStore: AnalyticsStoreInterface
  let statisticsStore: StatisticsStoreInterface
  let saveRevenueModification: SaveRevenueModification
  let logger: Logger

  const createHandler = () =>
    new SubscriptionExpiredEventHandler(
      getUserAnalyticsId,
      analyticsStore,
      statisticsStore,
      saveRevenueModification,
      logger,
    )

  beforeEach(() => {
    logger = {} as jest.Mocked<Logger>
    logger.error = jest.fn()

    event = {} as jest.Mocked<SubscriptionExpiredEvent>
    event.createdAt = new Date(1)
    event.type = 'SUBSCRIPTION_EXPIRED'
    event.payload = {
      subscriptionId: 1,
      userEmail: 'test@test.com',
      subscriptionName: SubscriptionName.PlusPlan,
      timestamp: 1,
      offline: false,
      totalActiveSubscriptionsCount: 123,
      userExistingSubscriptionsCount: 2,
      billingFrequency: 1,
      payAmount: 12.99,
    }

    getUserAnalyticsId = {} as jest.Mocked<GetUserAnalyticsId>
    getUserAnalyticsId.execute = jest.fn().mockReturnValue({ analyticsId: 3 })

    analyticsStore = {} as jest.Mocked<AnalyticsStoreInterface>
    analyticsStore.markActivity = jest.fn()

    statisticsStore = {} as jest.Mocked<StatisticsStoreInterface>
    statisticsStore.setMeasure = jest.fn()

    saveRevenueModification = {} as jest.Mocked<SaveRevenueModification>
    saveRevenueModification.execute = jest.fn().mockReturnValue(Result.ok<RevenueModification>())
  })

  it('should update analytics and statistics', async () => {
    await createHandler().handle(event)

    expect(analyticsStore.markActivity).toHaveBeenCalled()
    expect(statisticsStore.setMeasure).toHaveBeenCalled()
    expect(saveRevenueModification.execute).toHaveBeenCalled()
  })

  it('should log failure to save revenue modification', async () => {
    saveRevenueModification.execute = jest.fn().mockReturnValue(Result.fail('Oops'))

    await createHandler().handle(event)

    expect(logger.error).toHaveBeenCalled()
  })
})
