import { DomainEventHandlerInterface, PaymentFailedEvent } from '@standardnotes/domain-events'
import { inject, injectable, optional } from 'inversify'
import { Mixpanel } from 'mixpanel'

import TYPES from '../../Bootstrap/Types'
import { AnalyticsActivity } from '../Analytics/AnalyticsActivity'
import { AnalyticsStoreInterface } from '../Analytics/AnalyticsStoreInterface'
import { Period } from '../Time/Period'
import { GetUserAnalyticsId } from '../UseCase/GetUserAnalyticsId/GetUserAnalyticsId'

@injectable()
export class PaymentFailedEventHandler implements DomainEventHandlerInterface {
  constructor(
    @inject(TYPES.GetUserAnalyticsId) private getUserAnalyticsId: GetUserAnalyticsId,
    @inject(TYPES.AnalyticsStore) private analyticsStore: AnalyticsStoreInterface,
    @inject(TYPES.MixpanelClient) @optional() private mixpanelClient: Mixpanel | null,
  ) {}

  async handle(event: PaymentFailedEvent): Promise<void> {
    const analyticsMetadataOrError = await this.getUserAnalyticsId.execute({ userEmail: event.payload.userEmail })
    if (analyticsMetadataOrError.isFailed()) {
      return
    }
    const { analyticsId } = analyticsMetadataOrError.getValue()
    await this.analyticsStore.markActivity([AnalyticsActivity.PaymentFailed], analyticsId, [
      Period.Today,
      Period.ThisWeek,
      Period.ThisMonth,
    ])

    if (this.mixpanelClient !== null) {
      this.mixpanelClient.track(event.type, {
        distinct_id: analyticsId.toString(),
      })
    }
  }
}
