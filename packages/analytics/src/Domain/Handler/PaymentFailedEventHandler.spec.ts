import 'reflect-metadata'

import { PaymentFailedEvent } from '@standardnotes/domain-events'

import { PaymentFailedEventHandler } from './PaymentFailedEventHandler'
import { GetUserAnalyticsId } from '../UseCase/GetUserAnalyticsId/GetUserAnalyticsId'
import { AnalyticsStoreInterface } from '../Analytics/AnalyticsStoreInterface'

describe('PaymentFailedEventHandler', () => {
  let event: PaymentFailedEvent
  let getUserAnalyticsId: GetUserAnalyticsId
  let analyticsStore: AnalyticsStoreInterface

  const createHandler = () => new PaymentFailedEventHandler(getUserAnalyticsId, analyticsStore)

  beforeEach(() => {
    getUserAnalyticsId = {} as jest.Mocked<GetUserAnalyticsId>
    getUserAnalyticsId.execute = jest.fn().mockReturnValue({ analyticsId: 3 })

    analyticsStore = {} as jest.Mocked<AnalyticsStoreInterface>
    analyticsStore.markActivity = jest.fn()

    event = {} as jest.Mocked<PaymentFailedEvent>
    event.payload = {
      userEmail: 'test@test.com',
    }
  })

  it('should mark payment failed for analytics', async () => {
    await createHandler().handle(event)

    expect(analyticsStore.markActivity).toHaveBeenCalled()
  })
})
