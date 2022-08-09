import { AnalyticsActivity, AnalyticsStoreInterface, Period } from '@standardnotes/analytics'
import { DomainEventHandlerInterface, UserRegisteredEvent } from '@standardnotes/domain-events'
import { AxiosInstance } from 'axios'
import { inject, injectable } from 'inversify'
import { Logger } from 'winston'

import TYPES from '../../Bootstrap/Types'
import { GetUserAnalyticsId } from '../UseCase/GetUserAnalyticsId/GetUserAnalyticsId'

@injectable()
export class UserRegisteredEventHandler implements DomainEventHandlerInterface {
  constructor(
    @inject(TYPES.HTTPClient) private httpClient: AxiosInstance,
    @inject(TYPES.USER_SERVER_REGISTRATION_URL) private userServerRegistrationUrl: string,
    @inject(TYPES.USER_SERVER_AUTH_KEY) private userServerAuthKey: string,
    @inject(TYPES.GetUserAnalyticsId) private getUserAnalyticsId: GetUserAnalyticsId,
    @inject(TYPES.AnalyticsStore) private analyticsStore: AnalyticsStoreInterface,
    @inject(TYPES.Logger) private logger: Logger,
  ) {}

  async handle(event: UserRegisteredEvent): Promise<void> {
    if (!this.userServerRegistrationUrl) {
      this.logger.debug('User server registration url not defined. Skipped post-registration actions.')
      return
    }

    const { analyticsId } = await this.getUserAnalyticsId.execute({ userUuid: event.payload.userUuid })
    await this.analyticsStore.markActivity([AnalyticsActivity.Register], analyticsId, [Period.Today])

    await this.httpClient.request({
      method: 'POST',
      url: this.userServerRegistrationUrl,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      data: {
        key: this.userServerAuthKey,
        user: {
          email: event.payload.email,
          created_at: event.createdAt,
        },
      },
      validateStatus:
        /* istanbul ignore next */
        (status: number) => status >= 200 && status < 500,
    })
  }
}
