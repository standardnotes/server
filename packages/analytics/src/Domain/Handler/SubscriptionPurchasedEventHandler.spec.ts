import 'reflect-metadata'

import { SubscriptionName } from '@standardnotes/common'
import { SubscriptionPurchasedEvent } from '@standardnotes/domain-events'

import { SubscriptionPurchasedEventHandler } from './SubscriptionPurchasedEventHandler'
import { GetUserAnalyticsId } from '../UseCase/GetUserAnalyticsId/GetUserAnalyticsId'
import { AnalyticsStoreInterface } from '../Analytics/AnalyticsStoreInterface'
import { StatisticsStoreInterface } from '../Statistics/StatisticsStoreInterface'
import { Period } from '../Time/Period'

describe('SubscriptionPurchasedEventHandler', () => {
  let event: SubscriptionPurchasedEvent
  let subscriptionExpiresAt: number
  let getUserAnalyticsId: GetUserAnalyticsId
  let analyticsStore: AnalyticsStoreInterface
  let statisticsStore: StatisticsStoreInterface

  const createHandler = () => new SubscriptionPurchasedEventHandler(getUserAnalyticsId, analyticsStore, statisticsStore)

  beforeEach(() => {
    statisticsStore = {} as jest.Mocked<StatisticsStoreInterface>
    statisticsStore.incrementMeasure = jest.fn()
    statisticsStore.setMeasure = jest.fn()

    event = {} as jest.Mocked<SubscriptionPurchasedEvent>
    event.createdAt = new Date(1)
    event.payload = {
      subscriptionId: 1,
      userEmail: 'test@test.com',
      subscriptionName: SubscriptionName.ProPlan,
      subscriptionExpiresAt,
      timestamp: 60,
      offline: false,
      discountCode: null,
      limitedDiscountPurchased: false,
      newSubscriber: true,
      totalActiveSubscriptionsCount: 123,
      userRegisteredAt: 23,
    }

    getUserAnalyticsId = {} as jest.Mocked<GetUserAnalyticsId>
    getUserAnalyticsId.execute = jest.fn().mockReturnValue({ analyticsId: 3 })

    analyticsStore = {} as jest.Mocked<AnalyticsStoreInterface>
    analyticsStore.markActivity = jest.fn()
    analyticsStore.unmarkActivity = jest.fn()
  })

  it('should mark subscription creation statistics', async () => {
    await createHandler().handle(event)

    expect(statisticsStore.incrementMeasure).toHaveBeenCalled()
  })

  it("should not measure registration to subscription time if this is not user's first subscription", async () => {
    event.payload.newSubscriber = false

    await createHandler().handle(event)

    expect(statisticsStore.incrementMeasure).not.toHaveBeenCalled()
  })

  it('should update analytics on limited discount offer purchasing', async () => {
    event.payload.limitedDiscountPurchased = true

    await createHandler().handle(event)

    expect(analyticsStore.markActivity).toHaveBeenCalledWith(['limited-discount-offer-purchased'], 3, [Period.Today])
  })
})
