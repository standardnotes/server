import { DomainEventHandlerInterface, RefundProcessedEvent } from '@standardnotes/domain-events'
import { inject, injectable, optional } from 'inversify'
import { Mixpanel } from 'mixpanel'

import TYPES from '../../Bootstrap/Types'
import { StatisticMeasureName } from '../Statistics/StatisticMeasureName'
import { StatisticsStoreInterface } from '../Statistics/StatisticsStoreInterface'
import { Period } from '../Time/Period'
import { GetUserAnalyticsId } from '../UseCase/GetUserAnalyticsId/GetUserAnalyticsId'

@injectable()
export class RefundProcessedEventHandler implements DomainEventHandlerInterface {
  constructor(
    @inject(TYPES.GetUserAnalyticsId) private getUserAnalyticsId: GetUserAnalyticsId,
    @inject(TYPES.StatisticsStore) private statisticsStore: StatisticsStoreInterface,
    @inject(TYPES.MixpanelClient) @optional() private mixpanelClient: Mixpanel | null,
  ) {}

  async handle(event: RefundProcessedEvent): Promise<void> {
    const { analyticsId } = await this.getUserAnalyticsId.execute({ userEmail: event.payload.userEmail })

    await this.statisticsStore.incrementMeasure(StatisticMeasureName.NAMES.Refunds, event.payload.amount, [
      Period.Today,
      Period.ThisWeek,
      Period.ThisMonth,
    ])

    if (this.mixpanelClient !== null) {
      this.mixpanelClient.track(event.type, {
        distinct_id: analyticsId.toString(),
        amount: event.payload.amount,
      })
      this.mixpanelClient.people.track_charge(analyticsId.toString(), -event.payload.amount)
    }
  }
}
