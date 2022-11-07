import 'reflect-metadata'

import { SubscriptionName } from '@standardnotes/common'
import { SubscriptionReactivatedEvent } from '@standardnotes/domain-events'

import { SubscriptionReactivatedEventHandler } from './SubscriptionReactivatedEventHandler'
import { GetUserAnalyticsId } from '../UseCase/GetUserAnalyticsId/GetUserAnalyticsId'
import { AnalyticsStoreInterface } from '../Analytics/AnalyticsStoreInterface'
import { Period } from '../Time/Period'

describe('SubscriptionReactivatedEventHandler', () => {
  let event: SubscriptionReactivatedEvent
  let getUserAnalyticsId: GetUserAnalyticsId
  let analyticsStore: AnalyticsStoreInterface

  const createHandler = () => new SubscriptionReactivatedEventHandler(analyticsStore, getUserAnalyticsId)

  beforeEach(() => {
    event = {} as jest.Mocked<SubscriptionReactivatedEvent>
    event.createdAt = new Date(1)
    event.payload = {
      previousSubscriptionId: 1,
      currentSubscriptionId: 2,
      userEmail: 'test@test.com',
      subscriptionName: SubscriptionName.PlusPlan,
      subscriptionExpiresAt: 5,
      discountCode: 'exit-20',
    }

    getUserAnalyticsId = {} as jest.Mocked<GetUserAnalyticsId>
    getUserAnalyticsId.execute = jest.fn().mockReturnValue({ analyticsId: 3 })

    analyticsStore = {} as jest.Mocked<AnalyticsStoreInterface>
    analyticsStore.markActivity = jest.fn()
  })

  it('should mark subscription reactivated activity for analytics', async () => {
    await createHandler().handle(event)

    expect(analyticsStore.markActivity).toHaveBeenCalledWith(['subscription-reactivated'], 3, [
      Period.Today,
      Period.ThisWeek,
      Period.ThisMonth,
    ])
  })
})
