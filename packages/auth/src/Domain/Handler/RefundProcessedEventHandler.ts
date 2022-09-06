import { Period, StatisticsMeasure, StatisticsStoreInterface } from '@standardnotes/analytics'
import { DomainEventHandlerInterface, RefundProcessedEvent } from '@standardnotes/domain-events'
import { inject, injectable } from 'inversify'

import TYPES from '../../Bootstrap/Types'

@injectable()
export class RefundProcessedEventHandler implements DomainEventHandlerInterface {
  constructor(@inject(TYPES.StatisticsStore) private statisticsStore: StatisticsStoreInterface) {}

  async handle(event: RefundProcessedEvent): Promise<void> {
    await this.statisticsStore.incrementMeasure(StatisticsMeasure.Refunds, event.payload.amount, [
      Period.Today,
      Period.ThisWeek,
      Period.ThisMonth,
    ])
  }
}
