import 'reflect-metadata'

import { RefundProcessedEvent } from '@standardnotes/domain-events'

import { RefundProcessedEventHandler } from './RefundProcessedEventHandler'
import { StatisticsMeasure } from '../Statistics/StatisticsMeasure'
import { StatisticsStoreInterface } from '../Statistics/StatisticsStoreInterface'
import { Period } from '../Time/Period'

describe('RefundProcessedEventHandler', () => {
  let event: RefundProcessedEvent
  let statisticsStore: StatisticsStoreInterface

  const createHandler = () => new RefundProcessedEventHandler(statisticsStore)

  beforeEach(() => {
    statisticsStore = {} as jest.Mocked<StatisticsStoreInterface>
    statisticsStore.incrementMeasure = jest.fn()

    event = {} as jest.Mocked<RefundProcessedEvent>
    event.payload = {
      userEmail: 'test@test.com',
      amount: 12.45,
    }
  })

  it('should mark refunds for statistics', async () => {
    await createHandler().handle(event)

    expect(statisticsStore.incrementMeasure).toHaveBeenCalledWith(StatisticsMeasure.Refunds, 12.45, [
      Period.Today,
      Period.ThisWeek,
      Period.ThisMonth,
    ])
  })
})
