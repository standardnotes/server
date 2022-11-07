import 'reflect-metadata'

import { SubscriptionName } from '@standardnotes/common'
import { SubscriptionRenewedEvent } from '@standardnotes/domain-events'

import { SubscriptionRenewedEventHandler } from './SubscriptionRenewedEventHandler'
import { GetUserAnalyticsId } from '../UseCase/GetUserAnalyticsId/GetUserAnalyticsId'
import { AnalyticsStoreInterface } from '../Analytics/AnalyticsStoreInterface'

describe('SubscriptionRenewedEventHandler', () => {
  let event: SubscriptionRenewedEvent
  let getUserAnalyticsId: GetUserAnalyticsId
  let analyticsStore: AnalyticsStoreInterface

  const createHandler = () => new SubscriptionRenewedEventHandler(getUserAnalyticsId, analyticsStore)

  beforeEach(() => {
    event = {} as jest.Mocked<SubscriptionRenewedEvent>
    event.createdAt = new Date(1)
    event.payload = {
      subscriptionId: 1,
      userEmail: 'test@test.com',
      subscriptionName: SubscriptionName.ProPlan,
      subscriptionExpiresAt: 2,
      timestamp: 1,
      offline: false,
    }

    getUserAnalyticsId = {} as jest.Mocked<GetUserAnalyticsId>
    getUserAnalyticsId.execute = jest.fn().mockReturnValue({ analyticsId: 3 })

    analyticsStore = {} as jest.Mocked<AnalyticsStoreInterface>
    analyticsStore.markActivity = jest.fn()
    analyticsStore.unmarkActivity = jest.fn()
  })

  it('should track subscription renewed statistics', async () => {
    await createHandler().handle(event)

    expect(analyticsStore.markActivity).toHaveBeenCalled()
    expect(analyticsStore.unmarkActivity).toHaveBeenCalled()
  })
})
