import { DomainEventHandlerInterface, SubscriptionPurchasedEvent } from '@standardnotes/domain-events'
import { inject, injectable } from 'inversify'

import TYPES from '../../Bootstrap/Types'
import { AnalyticsActivity } from '../Analytics/AnalyticsActivity'
import { AnalyticsStoreInterface } from '../Analytics/AnalyticsStoreInterface'
import { StatisticsMeasure } from '../Statistics/StatisticsMeasure'
import { StatisticsStoreInterface } from '../Statistics/StatisticsStoreInterface'
import { Period } from '../Time/Period'
import { GetUserAnalyticsId } from '../UseCase/GetUserAnalyticsId/GetUserAnalyticsId'

@injectable()
export class SubscriptionPurchasedEventHandler implements DomainEventHandlerInterface {
  constructor(
    @inject(TYPES.GetUserAnalyticsId) private getUserAnalyticsId: GetUserAnalyticsId,
    @inject(TYPES.AnalyticsStore) private analyticsStore: AnalyticsStoreInterface,
    @inject(TYPES.StatisticsStore) private statisticsStore: StatisticsStoreInterface,
  ) {}

  async handle(event: SubscriptionPurchasedEvent): Promise<void> {
    const { analyticsId } = await this.getUserAnalyticsId.execute({ userEmail: event.payload.userEmail })
    await this.analyticsStore.markActivity([AnalyticsActivity.SubscriptionPurchased], analyticsId, [
      Period.Today,
      Period.ThisWeek,
      Period.ThisMonth,
    ])
    await this.analyticsStore.unmarkActivity(
      [AnalyticsActivity.ExistingCustomersChurn, AnalyticsActivity.NewCustomersChurn],
      analyticsId,
      [Period.Today, Period.ThisWeek, Period.ThisMonth],
    )

    if (event.payload.limitedDiscountPurchased) {
      await this.analyticsStore.markActivity([AnalyticsActivity.LimitedDiscountOfferPurchased], analyticsId, [
        Period.Today,
      ])
    }

    if (event.payload.newSubscriber) {
      await this.statisticsStore.incrementMeasure(
        StatisticsMeasure.RegistrationToSubscriptionTime,
        event.payload.timestamp - event.payload.userRegisteredAt,
        [Period.Today, Period.ThisWeek, Period.ThisMonth],
      )
      await this.statisticsStore.incrementMeasure(StatisticsMeasure.NewCustomers, 1, [
        Period.Today,
        Period.ThisWeek,
        Period.ThisMonth,
        Period.ThisYear,
      ])
      await this.statisticsStore.setMeasure(
        StatisticsMeasure.TotalCustomers,
        event.payload.totalActiveSubscriptionsCount,
        [Period.Today, Period.ThisWeek, Period.ThisMonth, Period.ThisYear],
      )
    }
  }
}
