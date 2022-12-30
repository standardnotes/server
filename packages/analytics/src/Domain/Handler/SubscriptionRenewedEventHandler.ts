import { DomainEventHandlerInterface, SubscriptionRenewedEvent } from '@standardnotes/domain-events'
import { inject, injectable, optional } from 'inversify'
import { Username } from '@standardnotes/domain-core'
import { Mixpanel } from 'mixpanel'

import TYPES from '../../Bootstrap/Types'
import { GetUserAnalyticsId } from '../UseCase/GetUserAnalyticsId/GetUserAnalyticsId'
import { AnalyticsActivity } from '../Analytics/AnalyticsActivity'
import { AnalyticsStoreInterface } from '../Analytics/AnalyticsStoreInterface'
import { Period } from '../Time/Period'
import { SaveRevenueModification } from '../UseCase/SaveRevenueModification/SaveRevenueModification'
import { SubscriptionEventType } from '../Subscription/SubscriptionEventType'
import { SubscriptionPlanName } from '../Subscription/SubscriptionPlanName'
import { Logger } from 'winston'
import { TimerInterface } from '@standardnotes/time'

@injectable()
export class SubscriptionRenewedEventHandler implements DomainEventHandlerInterface {
  constructor(
    @inject(TYPES.GetUserAnalyticsId) private getUserAnalyticsId: GetUserAnalyticsId,
    @inject(TYPES.AnalyticsStore) private analyticsStore: AnalyticsStoreInterface,
    @inject(TYPES.SaveRevenueModification) private saveRevenueModification: SaveRevenueModification,
    @inject(TYPES.Logger) private logger: Logger,
    @inject(TYPES.MixpanelClient) @optional() private mixpanelClient: Mixpanel | null,
    @inject(TYPES.Timer) private timer: TimerInterface,
  ) {}

  async handle(event: SubscriptionRenewedEvent): Promise<void> {
    const { analyticsId, userUuid } = await this.getUserAnalyticsId.execute({ userEmail: event.payload.userEmail })
    await this.analyticsStore.markActivity([AnalyticsActivity.SubscriptionRenewed], analyticsId, [
      Period.Today,
      Period.ThisWeek,
      Period.ThisMonth,
    ])
    await this.analyticsStore.unmarkActivity(
      [AnalyticsActivity.ExistingCustomersChurn, AnalyticsActivity.NewCustomersChurn],
      analyticsId,
      [Period.Today, Period.ThisWeek, Period.ThisMonth],
    )

    const result = await this.saveRevenueModification.execute({
      billingFrequency: event.payload.billingFrequency,
      eventType: SubscriptionEventType.create(event.type).getValue(),
      newSubscriber: false,
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
        billing_frequency: event.payload.billingFrequency,
        pay_amount: event.payload.payAmount,
      })
      this.mixpanelClient.people.set(analyticsId.toString(), 'subscription', event.payload.subscriptionName)
    }
  }
}
