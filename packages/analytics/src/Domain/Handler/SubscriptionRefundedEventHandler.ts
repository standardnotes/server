import { DomainEventHandlerInterface, SubscriptionRefundedEvent } from '@standardnotes/domain-events'
import { inject, injectable } from 'inversify'
import { Logger } from 'winston'

import TYPES from '../../Bootstrap/Types'
import { AnalyticsActivity } from '../Analytics/AnalyticsActivity'
import { AnalyticsStoreInterface } from '../Analytics/AnalyticsStoreInterface'
import { Email } from '../Common/Email'
import { StatisticsMeasure } from '../Statistics/StatisticsMeasure'
import { StatisticsStoreInterface } from '../Statistics/StatisticsStoreInterface'
import { SubscriptionEventType } from '../Subscription/SubscriptionEventType'
import { SubscriptionPlanName } from '../Subscription/SubscriptionPlanName'
import { Period } from '../Time/Period'
import { GetUserAnalyticsId } from '../UseCase/GetUserAnalyticsId/GetUserAnalyticsId'
import { SaveRevenueModification } from '../UseCase/SaveRevenueModification/SaveRevenueModification'

@injectable()
export class SubscriptionRefundedEventHandler implements DomainEventHandlerInterface {
  constructor(
    @inject(TYPES.GetUserAnalyticsId) private getUserAnalyticsId: GetUserAnalyticsId,
    @inject(TYPES.AnalyticsStore) private analyticsStore: AnalyticsStoreInterface,
    @inject(TYPES.StatisticsStore) private statisticsStore: StatisticsStoreInterface,
    @inject(TYPES.SaveRevenueModification) private saveRevenueModification: SaveRevenueModification,
    @inject(TYPES.Logger) private logger: Logger,
  ) {}

  async handle(event: SubscriptionRefundedEvent): Promise<void> {
    const { analyticsId, userUuid } = await this.getUserAnalyticsId.execute({ userEmail: event.payload.userEmail })
    await this.analyticsStore.markActivity([AnalyticsActivity.SubscriptionRefunded], analyticsId, [
      Period.Today,
      Period.ThisWeek,
      Period.ThisMonth,
    ])

    await this.markChurnActivity(analyticsId, event)

    const result = await this.saveRevenueModification.execute({
      billingFrequency: event.payload.billingFrequency,
      eventType: SubscriptionEventType.create(event.type).getValue(),
      newSubscriber: event.payload.userExistingSubscriptionsCount === 1,
      payedAmount: event.payload.payAmount,
      planName: SubscriptionPlanName.create(event.payload.subscriptionName).getValue(),
      subscriptionId: event.payload.subscriptionId,
      userEmail: Email.create(event.payload.userEmail).getValue(),
      userUuid,
    })

    if (result.isFailed()) {
      this.logger.error(`[${event.type}] Could not save revenue modification: ${result.getError()}`)
    }
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
