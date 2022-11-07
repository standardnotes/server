import { DomainEventHandlerInterface, SubscriptionRefundedEvent } from '@standardnotes/domain-events'
import { inject, injectable } from 'inversify'

import TYPES from '../../Bootstrap/Types'
import { AnalyticsActivity } from '../Analytics/AnalyticsActivity'
import { AnalyticsStoreInterface } from '../Analytics/AnalyticsStoreInterface'
import { StatisticsMeasure } from '../Statistics/StatisticsMeasure'
import { StatisticsStoreInterface } from '../Statistics/StatisticsStoreInterface'
import { Period } from '../Time/Period'
import { GetUserAnalyticsId } from '../UseCase/GetUserAnalyticsId/GetUserAnalyticsId'

@injectable()
export class SubscriptionRefundedEventHandler implements DomainEventHandlerInterface {
  constructor(
    @inject(TYPES.GetUserAnalyticsId) private getUserAnalyticsId: GetUserAnalyticsId,
    @inject(TYPES.AnalyticsStore) private analyticsStore: AnalyticsStoreInterface,
    @inject(TYPES.StatisticsStore) private statisticsStore: StatisticsStoreInterface,
  ) {}

  async handle(event: SubscriptionRefundedEvent): Promise<void> {
    const { analyticsId } = await this.getUserAnalyticsId.execute({ userEmail: event.payload.userEmail })
    await this.analyticsStore.markActivity([AnalyticsActivity.SubscriptionRefunded], analyticsId, [
      Period.Today,
      Period.ThisWeek,
      Period.ThisMonth,
    ])

    await this.markChurnActivity(analyticsId, event)
  }

  private async markChurnActivity(analyticsId: number, event: SubscriptionRefundedEvent): Promise<void> {
    const churnActivity =
      event.payload.userExistingSubscriptionsCount > 1
        ? AnalyticsActivity.ExistingCustomersChurn
        : AnalyticsActivity.NewCustomersChurn

    for (const period of [Period.ThisMonth, Period.ThisWeek, Period.Today]) {
      const customerPurchasedInPeriod = await this.analyticsStore.wasActivityDone(
        AnalyticsActivity.SubscriptionPurchased,
        analyticsId,
        period,
      )
      if (customerPurchasedInPeriod) {
        await this.analyticsStore.markActivity([churnActivity], analyticsId, [period])
      }
    }

    await this.statisticsStore.setMeasure(
      StatisticsMeasure.TotalCustomers,
      event.payload.totalActiveSubscriptionsCount,
      [Period.Today, Period.ThisWeek, Period.ThisMonth, Period.ThisYear],
    )
  }
}
