import 'reflect-metadata'

import { PaymentSuccessEvent } from '@standardnotes/domain-events'

import { PaymentSuccessEventHandler } from './PaymentSuccessEventHandler'
import { GetUserAnalyticsId } from '../UseCase/GetUserAnalyticsId/GetUserAnalyticsId'
import { Logger } from 'winston'
import { StatisticsStoreInterface } from '../Statistics/StatisticsStoreInterface'
import { AnalyticsStoreInterface } from '../Analytics/AnalyticsStoreInterface'
import { Period } from '../Time/Period'

describe('PaymentSuccessEventHandler', () => {
  let event: PaymentSuccessEvent
  let getUserAnalyticsId: GetUserAnalyticsId
  let analyticsStore: AnalyticsStoreInterface
  let statisticsStore: StatisticsStoreInterface
  let logger: Logger

  const createHandler = () =>
    new PaymentSuccessEventHandler(getUserAnalyticsId, analyticsStore, statisticsStore, logger)

  beforeEach(() => {
    getUserAnalyticsId = {} as jest.Mocked<GetUserAnalyticsId>
    getUserAnalyticsId.execute = jest.fn().mockReturnValue({ analyticsId: 3 })

    analyticsStore = {} as jest.Mocked<AnalyticsStoreInterface>
    analyticsStore.markActivity = jest.fn()

    statisticsStore = {} as jest.Mocked<StatisticsStoreInterface>
    statisticsStore.incrementMeasure = jest.fn()

    event = {} as jest.Mocked<PaymentSuccessEvent>
    event.payload = {
      userEmail: 'test@test.com',
      amount: 12.45,
      billingFrequency: 12,
      paymentType: 'initial',
      subscriptionName: 'PRO_PLAN',
    }

    logger = {} as jest.Mocked<Logger>
    logger.warn = jest.fn()
  })

  it('should mark payment success for analytics', async () => {
    await createHandler().handle(event)

    expect(analyticsStore.markActivity).toHaveBeenCalled()
    expect(statisticsStore.incrementMeasure).toHaveBeenNthCalledWith(
      2,
      'pro-subscription-initial-annual-payments-income',
      12.45,
      [Period.Today, Period.ThisWeek, Period.ThisMonth],
    )
  })

  it('should mark non-detailed payment success statistics for analytics', async () => {
    event.payload = {
      userEmail: 'test@test.com',
      amount: 12.45,
      billingFrequency: 13,
      paymentType: 'initial',
      subscriptionName: 'PRO_PLAN',
    }

    await createHandler().handle(event)

    expect(statisticsStore.incrementMeasure).toBeCalledTimes(1)
    expect(statisticsStore.incrementMeasure).toHaveBeenNthCalledWith(1, 'income', 12.45, [
      Period.Today,
      Period.ThisWeek,
      Period.ThisMonth,
    ])
  })
})
