import { DomainEventHandlerInterface, SubscriptionRenewedEvent } from '@standardnotes/domain-events'
import { inject, injectable } from 'inversify'

import TYPES from '../../Bootstrap/Types'
import { GetUserAnalyticsId } from '../UseCase/GetUserAnalyticsId/GetUserAnalyticsId'
import { AnalyticsActivity } from '../Analytics/AnalyticsActivity'
import { AnalyticsStoreInterface } from '../Analytics/AnalyticsStoreInterface'
import { Period } from '../Time/Period'
import { SaveRevenueModification } from '../UseCase/SaveRevenueModification/SaveRevenueModification'
import { Email } from '../Common/Email'
import { SubscriptionEventType } from '../Subscription/SubscriptionEventType'
import { SubscriptionPlanName } from '../Subscription/SubscriptionPlanName'

@injectable()
export class SubscriptionRenewedEventHandler implements DomainEventHandlerInterface {
  constructor(
    @inject(TYPES.GetUserAnalyticsId) private getUserAnalyticsId: GetUserAnalyticsId,
    @inject(TYPES.AnalyticsStore) private analyticsStore: AnalyticsStoreInterface,
    @inject(TYPES.SaveRevenueModification) private saveRevenueModification: SaveRevenueModification,
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

    await this.saveRevenueModification.execute({
      billingFrequency: event.payload.billingFrequency,
      eventType: SubscriptionEventType.create(event.type).getValue(),
      newSubscriber: false,
      payedAmount: event.payload.payAmount,
      planName: SubscriptionPlanName.create(event.payload.subscriptionName).getValue(),
      subscriptionId: event.payload.subscriptionId,
      userEmail: Email.create(event.payload.userEmail).getValue(),
      userUuid,
    })
  }
}
