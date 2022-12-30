import { Username } from '@standardnotes/domain-core'
import { DomainEventHandlerInterface, SubscriptionRefundedEvent } from '@standardnotes/domain-events'
import { inject, injectable, optional } from 'inversify'
import { Logger } from 'winston'
import { Mixpanel } from 'mixpanel'

import TYPES from '../../Bootstrap/Types'
import { AnalyticsActivity } from '../Analytics/AnalyticsActivity'
import { AnalyticsStoreInterface } from '../Analytics/AnalyticsStoreInterface'
import { StatisticMeasureName } from '../Statistics/StatisticMeasureName'
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
    @inject(TYPES.MixpanelClient) @optional() private mixpanelClient: Mixpanel | null,
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
      username: Username.create(event.payload.userEmail).getValue(),
      userUuid,
    })

    if (result.isFailed()) {
      this.logger.error(
        `[${event.type}][${event.payload.subscriptionId}] Could not save revenue modification: ${result.getError()}`,
      )
    }

    if (this.mixpanelClient !== null) {
      this.mixpanelClient.track(event.type, {
        distinct_id: analyticsId.toString(),
        subscription_name: event.payload.subscriptionName,
        user_existing_subscriptions_count: event.payload.userExistingSubscriptionsCount,
        total_active_subscriptions_count: event.payload.totalActiveSubscriptionsCount,
        offline: event.payload.offline,
        billing_frequency: event.payload.billingFrequency,
        pay_amount: event.payload.payAmount,
      })
      this.mixpanelClient.people.set(analyticsId.toString(), 'subscription', 'free')
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
      StatisticMeasureName.NAMES.TotalCustomers,
      event.payload.totalActiveSubscriptionsCount,
      [Period.Today, Period.ThisWeek, Period.ThisMonth, Period.ThisYear],
    )
  }
}
