import 'reflect-metadata'

import { SubscriptionName } from '@standardnotes/common'
import { SubscriptionRefundedEvent } from '@standardnotes/domain-events'

import { GetUserAnalyticsId } from '../UseCase/GetUserAnalyticsId/GetUserAnalyticsId'
import { AnalyticsStoreInterface } from '../Analytics/AnalyticsStoreInterface'

import { SubscriptionRefundedEventHandler } from './SubscriptionRefundedEventHandler'
import { StatisticsStoreInterface } from '../Statistics/StatisticsStoreInterface'
import { AnalyticsActivity } from '../Analytics/AnalyticsActivity'
import { Period } from '../Time/Period'

describe('SubscriptionRefundedEventHandler', () => {
  let event: SubscriptionRefundedEvent
  let getUserAnalyticsId: GetUserAnalyticsId
  let analyticsStore: AnalyticsStoreInterface
  let statisticsStore: StatisticsStoreInterface

  const createHandler = () => new SubscriptionRefundedEventHandler(getUserAnalyticsId, analyticsStore, statisticsStore)

  beforeEach(() => {
    event = {} as jest.Mocked<SubscriptionRefundedEvent>
    event.createdAt = new Date(1)
    event.payload = {
      subscriptionId: 1,
      userEmail: 'test@test.com',
      subscriptionName: SubscriptionName.PlusPlan,
      timestamp: 1,
      offline: false,
      userExistingSubscriptionsCount: 3,
      totalActiveSubscriptionsCount: 1,
    }

    getUserAnalyticsId = {} as jest.Mocked<GetUserAnalyticsId>
    getUserAnalyticsId.execute = jest.fn().mockReturnValue({ analyticsId: 3 })

    analyticsStore = {} as jest.Mocked<AnalyticsStoreInterface>
    analyticsStore.markActivity = jest.fn()
    analyticsStore.wasActivityDone = jest.fn().mockReturnValue(true)

    statisticsStore = {} as jest.Mocked<StatisticsStoreInterface>
    statisticsStore.setMeasure = jest.fn()
  })

  it('should mark churn for new customer', async () => {
    event.payload.userExistingSubscriptionsCount = 1
    await createHandler().handle(event)

    expect(analyticsStore.markActivity).toHaveBeenCalledWith([AnalyticsActivity.SubscriptionRefunded], 3, [
      Period.Today,
      Period.ThisWeek,
      Period.ThisMonth,
    ])

    expect(analyticsStore.markActivity).toHaveBeenCalledWith([AnalyticsActivity.NewCustomersChurn], 3, [
      Period.ThisMonth,
    ])
  })

  it('should mark churn for existing customer', async () => {
    await createHandler().handle(event)

    expect(analyticsStore.markActivity).toHaveBeenCalledWith([AnalyticsActivity.ExistingCustomersChurn], 3, [
      Period.ThisMonth,
    ])
  })

  it('should not mark churn if customer did not purchase subscription in defined analytic periods', async () => {
    analyticsStore.wasActivityDone = jest.fn().mockReturnValue(false)

    await createHandler().handle(event)

    expect(analyticsStore.markActivity).not.toHaveBeenCalledWith([AnalyticsActivity.ExistingCustomersChurn], 3, [
      Period.ThisMonth,
    ])
  })
})
