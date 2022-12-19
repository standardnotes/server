import { DomainEventHandlerInterface, RefundProcessedEvent } from '@standardnotes/domain-events'
import { inject, injectable } from 'inversify'

import TYPES from '../../Bootstrap/Types'
import { StatisticMeasureName } from '../Statistics/StatisticMeasureName'
import { StatisticsStoreInterface } from '../Statistics/StatisticsStoreInterface'
import { Period } from '../Time/Period'

@injectable()
export class RefundProcessedEventHandler implements DomainEventHandlerInterface {
  constructor(@inject(TYPES.StatisticsStore) private statisticsStore: StatisticsStoreInterface) {}

  async handle(event: RefundProcessedEvent): Promise<void> {
    await this.statisticsStore.incrementMeasure(StatisticMeasureName.NAMES.Refunds, event.payload.amount, [
      Period.Today,
      Period.ThisWeek,
      Period.ThisMonth,
    ])
  }
}
