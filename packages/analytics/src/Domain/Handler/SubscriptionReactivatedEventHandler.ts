import { DomainEventHandlerInterface, SubscriptionReactivatedEvent } from '@standardnotes/domain-events'
import { TimerInterface } from '@standardnotes/time'
import { inject, injectable, optional } from 'inversify'
import { Mixpanel } from 'mixpanel'

import TYPES from '../../Bootstrap/Types'
import { AnalyticsActivity } from '../Analytics/AnalyticsActivity'
import { AnalyticsStoreInterface } from '../Analytics/AnalyticsStoreInterface'
import { Period } from '../Time/Period'
import { GetUserAnalyticsId } from '../UseCase/GetUserAnalyticsId/GetUserAnalyticsId'

@injectable()
export class SubscriptionReactivatedEventHandler implements DomainEventHandlerInterface {
  constructor(
    @inject(TYPES.AnalyticsStore) private analyticsStore: AnalyticsStoreInterface,
    @inject(TYPES.GetUserAnalyticsId) private getUserAnalyticsId: GetUserAnalyticsId,
    @inject(TYPES.MixpanelClient) @optional() private mixpanelClient: Mixpanel | null,
    @inject(TYPES.Timer) private timer: TimerInterface,
  ) {}

  async handle(event: SubscriptionReactivatedEvent): Promise<void> {
    const { analyticsId } = await this.getUserAnalyticsId.execute({ userEmail: event.payload.userEmail })
    await this.analyticsStore.markActivity([AnalyticsActivity.SubscriptionReactivated], analyticsId, [
      Period.Today,
      Period.ThisWeek,
      Period.ThisMonth,
    ])

    if (this.mixpanelClient !== null) {
      this.mixpanelClient.track(event.type, {
        distinct_id: analyticsId.toString(),
        subscription_name: event.payload.subscriptionName,
        subscription_expires_at: this.timer.convertMicrosecondsToDate(event.payload.subscriptionExpiresAt),
        discount_code: event.payload.discountCode,
      })

      this.mixpanelClient.people.set(analyticsId.toString(), 'subscription', event.payload.subscriptionName)
    }
  }
}
