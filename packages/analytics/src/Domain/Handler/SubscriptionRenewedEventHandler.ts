import { DomainEventHandlerInterface, SubscriptionRenewedEvent } from '@standardnotes/domain-events'
import { inject, injectable } from 'inversify'

import TYPES from '../../Bootstrap/Types'
import { GetUserAnalyticsId } from '../UseCase/GetUserAnalyticsId/GetUserAnalyticsId'
import { AnalyticsActivity } from '../Analytics/AnalyticsActivity'
import { AnalyticsStoreInterface } from '../Analytics/AnalyticsStoreInterface'
import { Period } from '../Time/Period'

@injectable()
export class SubscriptionRenewedEventHandler implements DomainEventHandlerInterface {
  constructor(
    @inject(TYPES.GetUserAnalyticsId) private getUserAnalyticsId: GetUserAnalyticsId,
    @inject(TYPES.AnalyticsStore) private analyticsStore: AnalyticsStoreInterface,
  ) {}

  async handle(event: SubscriptionRenewedEvent): Promise<void> {
    const { analyticsId } = await this.getUserAnalyticsId.execute({ userEmail: event.payload.userEmail })
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
  }
}
