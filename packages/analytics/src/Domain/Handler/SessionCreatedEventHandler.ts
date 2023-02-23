import { SessionCreatedEvent, DomainEventHandlerInterface } from '@standardnotes/domain-events'
import { inject, injectable, optional } from 'inversify'
import { Mixpanel } from 'mixpanel'

import TYPES from '../../Bootstrap/Types'
import { GetUserAnalyticsId } from '../UseCase/GetUserAnalyticsId/GetUserAnalyticsId'

@injectable()
export class SessionCreatedEventHandler implements DomainEventHandlerInterface {
  constructor(
    @inject(TYPES.GetUserAnalyticsId) private getUserAnalyticsId: GetUserAnalyticsId,
    @inject(TYPES.MixpanelClient) @optional() private mixpanelClient: Mixpanel | null,
  ) {}

  async handle(event: SessionCreatedEvent): Promise<void> {
    const { analyticsId } = await this.getUserAnalyticsId.execute({ userUuid: event.payload.userUuid })

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
