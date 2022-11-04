import { DomainEventHandlerInterface, SubscriptionCancelledEvent } from '@standardnotes/domain-events'
import { inject, injectable } from 'inversify'

import TYPES from '../../Bootstrap/Types'
import { AnalyticsActivity } from '../Analytics/AnalyticsActivity'
import { AnalyticsStoreInterface } from '../Analytics/AnalyticsStoreInterface'
import { StatisticsMeasure } from '../Statistics/StatisticsMeasure'
import { StatisticsStoreInterface } from '../Statistics/StatisticsStoreInterface'
import { Period } from '../Time/Period'
import { GetUserAnalyticsId } from '../UseCase/GetUserAnalyticsId/GetUserAnalyticsId'

@injectable()
export class SubscriptionCancelledEventHandler implements DomainEventHandlerInterface {
  constructor(
    @inject(TYPES.GetUserAnalyticsId) private getUserAnalyticsId: GetUserAnalyticsId,
    @inject(TYPES.AnalyticsStore) private analyticsStore: AnalyticsStoreInterface,
    @inject(TYPES.StatisticsStore) private statisticsStore: StatisticsStoreInterface,
  ) {}

  async handle(event: SubscriptionCancelledEvent): Promise<void> {
    const { analyticsId } = await this.getUserAnalyticsId.execute({ userEmail: event.payload.userEmail })
    await this.analyticsStore.markActivity([AnalyticsActivity.SubscriptionCancelled], analyticsId, [
      Period.Today,
      Period.ThisWeek,
      Period.ThisMonth,
    ])

    await this.trackSubscriptionStatistics(event)
  }

  private async trackSubscriptionStatistics(event: SubscriptionCancelledEvent) {
    if (this.isLegacy5yearSubscriptionPlan(event.payload.subscriptionEndsAt, event.payload.subscriptionCreatedAt)) {
      return
    }

    const subscriptionLength = event.payload.timestamp - event.payload.subscriptionCreatedAt
    await this.statisticsStore.incrementMeasure(StatisticsMeasure.SubscriptionLength, subscriptionLength, [
      Period.Today,
      Period.ThisWeek,
      Period.ThisMonth,
    ])

    const remainingSubscriptionTime = event.payload.subscriptionEndsAt - event.payload.timestamp
    const totalSubscriptionTime = event.payload.subscriptionEndsAt - event.payload.lastPayedAt

    const remainingSubscriptionPercentage = Math.floor((remainingSubscriptionTime / totalSubscriptionTime) * 100)

    await this.statisticsStore.incrementMeasure(
      StatisticsMeasure.RemainingSubscriptionTimePercentage,
      remainingSubscriptionPercentage,
      [Period.Today, Period.ThisWeek, Period.ThisMonth],
    )
  }

  private isLegacy5yearSubscriptionPlan(subscriptionEndsAt: number, subscriptionCreatedAt: number) {
    const fourYearsInMicroseconds = 126_230_400_000_000

    return subscriptionEndsAt - subscriptionCreatedAt > fourYearsInMicroseconds
  }
}
