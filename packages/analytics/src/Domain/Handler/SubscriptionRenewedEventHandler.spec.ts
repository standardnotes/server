import 'reflect-metadata'

import { SubscriptionName } from '@standardnotes/common'
import { SubscriptionRenewedEvent } from '@standardnotes/domain-events'
import { Result } from '@standardnotes/domain-core'

import { SubscriptionRenewedEventHandler } from './SubscriptionRenewedEventHandler'
import { GetUserAnalyticsId } from '../UseCase/GetUserAnalyticsId/GetUserAnalyticsId'
import { AnalyticsStoreInterface } from '../Analytics/AnalyticsStoreInterface'
import { SaveRevenueModification } from '../UseCase/SaveRevenueModification/SaveRevenueModification'
import { RevenueModification } from '../Revenue/RevenueModification'
import { Logger } from 'winston'

describe('SubscriptionRenewedEventHandler', () => {
  let event: SubscriptionRenewedEvent
  let getUserAnalyticsId: GetUserAnalyticsId
  let analyticsStore: AnalyticsStoreInterface
  let saveRevenueModification: SaveRevenueModification
  let logger: Logger

  const createHandler = () =>
    new SubscriptionRenewedEventHandler(getUserAnalyticsId, analyticsStore, saveRevenueModification, logger)

  beforeEach(() => {
    logger = {} as jest.Mocked<Logger>
    logger.error = jest.fn()

    event = {} as jest.Mocked<SubscriptionRenewedEvent>
    event.createdAt = new Date(1)
    event.type = 'SUBSCRIPTION_RENEWED'
    event.payload = {
      subscriptionId: 1,
      userEmail: 'test@test.com',
      subscriptionName: SubscriptionName.ProPlan,
      subscriptionExpiresAt: 2,
      timestamp: 1,
      offline: false,
      billingFrequency: 1,
      payAmount: 12.99,
    }

    getUserAnalyticsId = {} as jest.Mocked<GetUserAnalyticsId>
    getUserAnalyticsId.execute = jest.fn().mockReturnValue({ analyticsId: 3 })

    analyticsStore = {} as jest.Mocked<AnalyticsStoreInterface>
    analyticsStore.markActivity = jest.fn()
    analyticsStore.unmarkActivity = jest.fn()

    saveRevenueModification = {} as jest.Mocked<SaveRevenueModification>
    saveRevenueModification.execute = jest.fn().mockReturnValue(Result.ok<RevenueModification>())
  })

  it('should track subscription renewed statistics', async () => {
    await createHandler().handle(event)

    expect(analyticsStore.markActivity).toHaveBeenCalled()
    expect(analyticsStore.unmarkActivity).toHaveBeenCalled()
    expect(saveRevenueModification.execute).toHaveBeenCalled()
  })

  it('should log failure to save revenue modification', async () => {
    saveRevenueModification.execute = jest.fn().mockReturnValue(Result.fail('Oops'))

    await createHandler().handle(event)

    expect(logger.error).toHaveBeenCalled()
  })
})
