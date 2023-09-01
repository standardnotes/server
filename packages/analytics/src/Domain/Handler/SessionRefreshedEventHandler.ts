import { SessionRefreshedEvent, DomainEventHandlerInterface } from '@standardnotes/domain-events'
import { inject, injectable, optional } from 'inversify'
import { Mixpanel } from 'mixpanel'

import TYPES from '../../Bootstrap/Types'
import { GetUserAnalyticsId } from '../UseCase/GetUserAnalyticsId/GetUserAnalyticsId'

@injectable()
export class SessionRefreshedEventHandler implements DomainEventHandlerInterface {
  constructor(
    @inject(TYPES.GetUserAnalyticsId) private getUserAnalyticsId: GetUserAnalyticsId,
    @inject(TYPES.MixpanelClient) @optional() private mixpanelClient: Mixpanel | null,
  ) {}

  async handle(event: SessionRefreshedEvent): Promise<void> {
    const analyticsMetadataOrError = await this.getUserAnalyticsId.execute({ userUuid: event.payload.userUuid })
    if (analyticsMetadataOrError.isFailed()) {
      return
    }
    const { analyticsId } = analyticsMetadataOrError.getValue()

    if (this.mixpanelClient !== null) {
      this.mixpanelClient.track(event.type, {
        distinct_id: analyticsId.toString(),
      })

      this.mixpanelClient.track('GENERAL_ACTIVITY', {
        distinct_id: analyticsId.toString(),
      })
    }
  }
}
