import { DomainEventHandlerInterface, UserRegisteredEvent } from '@standardnotes/domain-events'
import { AxiosInstance } from 'axios'
import { inject, injectable } from 'inversify'
import { Logger } from 'winston'

import TYPES from '../../Bootstrap/Types'

@injectable()
export class UserRegisteredEventHandler implements DomainEventHandlerInterface {
  constructor(
    @inject(TYPES.Auth_HTTPClient) private httpClient: AxiosInstance,
    @inject(TYPES.Auth_USER_SERVER_REGISTRATION_URL) private userServerRegistrationUrl: string,
    @inject(TYPES.Auth_USER_SERVER_AUTH_KEY) private userServerAuthKey: string,
    @inject(TYPES.Auth_Logger) private logger: Logger,
  ) {}

  async handle(event: UserRegisteredEvent): Promise<void> {
    if (!this.userServerRegistrationUrl) {
      this.logger.debug('User server registration url not defined. Skipped post-registration actions.')
      return
    }

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
