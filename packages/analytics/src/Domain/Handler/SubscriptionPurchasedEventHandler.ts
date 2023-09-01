import { Username } from '@standardnotes/domain-core'
import { DomainEventHandlerInterface, SubscriptionPurchasedEvent } from '@standardnotes/domain-events'
import { TimerInterface } from '@standardnotes/time'
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
export class SubscriptionPurchasedEventHandler implements DomainEventHandlerInterface {
  constructor(
    @inject(TYPES.GetUserAnalyticsId) private getUserAnalyticsId: GetUserAnalyticsId,
    @inject(TYPES.AnalyticsStore) private analyticsStore: AnalyticsStoreInterface,
    @inject(TYPES.StatisticsStore) private statisticsStore: StatisticsStoreInterface,
    @inject(TYPES.SaveRevenueModification) private saveRevenueModification: SaveRevenueModification,
    @inject(TYPES.Logger) private logger: Logger,
    @inject(TYPES.MixpanelClient) @optional() private mixpanelClient: Mixpanel | null,
    @inject(TYPES.Timer) private timer: TimerInterface,
  ) {}

  async handle(event: SubscriptionPurchasedEvent): Promise<void> {
    const analyticsMetadataOrError = await this.getUserAnalyticsId.execute({ userEmail: event.payload.userEmail })
    if (analyticsMetadataOrError.isFailed()) {
      return
    }
    const { analyticsId, userUuid } = analyticsMetadataOrError.getValue()
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
        StatisticMeasureName.NAMES.RegistrationToSubscriptionTime,
        event.payload.timestamp - event.payload.userRegisteredAt,
        [Period.Today, Period.ThisWeek, Period.ThisMonth],
      )
      await this.statisticsStore.incrementMeasure(StatisticMeasureName.NAMES.NewCustomers, 1, [
        Period.Today,
        Period.ThisWeek,
        Period.ThisMonth,
        Period.ThisYear,
      ])
      await this.statisticsStore.setMeasure(
        StatisticMeasureName.NAMES.TotalCustomers,
        event.payload.totalActiveSubscriptionsCount,
        [Period.Today, Period.ThisWeek, Period.ThisMonth, Period.ThisYear],
      )
    }

    const result = await this.saveRevenueModification.execute({
      billingFrequency: event.payload.billingFrequency,
      eventType: SubscriptionEventType.create(event.type).getValue(),
      newSubscriber: event.payload.newSubscriber,
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
        subscription_expires_at: this.timer.convertMicrosecondsToDate(event.payload.subscriptionExpiresAt),
        offline: event.payload.offline,
        discount_code: event.payload.discountCode,
        limited_discount_purchased: event.payload.limitedDiscountPurchased,
        new_subscriber: event.payload.newSubscriber,
        user_registered_at: this.timer.convertMicrosecondsToDate(event.payload.userRegisteredAt),
        billing_frequency: event.payload.billingFrequency,
        pay_amount: event.payload.payAmount,
      })

      this.mixpanelClient.people.set(analyticsId.toString(), 'subscription', event.payload.subscriptionName)
    }
  }
}
