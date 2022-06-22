import { AxiosInstance } from 'axios'
import { RoleName } from '@standardnotes/common'
import { inject, injectable } from 'inversify'
import { Logger } from 'winston'

import TYPES from '../../Bootstrap/Types'
import { DomainEventFactoryInterface } from '../../Domain/Event/DomainEventFactoryInterface'
import { User } from '../../Domain/User/User'
import { WebSocketsConnectionRepositoryInterface } from '../../Domain/WebSockets/WebSocketsConnectionRepositoryInterface'
import { ClientServiceInterface } from '../../Domain/Client/ClientServiceInterface'

@injectable()
export class WebSocketsClientService implements ClientServiceInterface {
  constructor(
    @inject(TYPES.WebSocketsConnectionRepository)
    private webSocketsConnectionRepository: WebSocketsConnectionRepositoryInterface,
    @inject(TYPES.DomainEventFactory) private domainEventFactory: DomainEventFactoryInterface,
    @inject(TYPES.HTTPClient) private httpClient: AxiosInstance,
    @inject(TYPES.WEBSOCKETS_API_URL) private webSocketsApiUrl: string,
    @inject(TYPES.Logger) private logger: Logger,
  ) {}

  async sendUserRolesChangedEvent(user: User): Promise<void> {
    if (!this.webSocketsApiUrl) {
      this.logger.debug('Web Sockets API url not defined. Skipped sending user role changed event.')

      return
    }

    const userConnections = await this.webSocketsConnectionRepository.findAllByUserUuid(user.uuid)
    const event = this.domainEventFactory.createUserRolesChangedEvent(
      user.uuid,
      user.email,
      (await user.roles).map((role) => role.name) as RoleName[],
    )

    for (const connectionUuid of userConnections) {
      await this.httpClient.request({
        method: 'POST',
        url: `${this.webSocketsApiUrl}/${connectionUuid}`,
        headers: {
          Accept: 'text/plain',
          'Content-Type': 'text/plain',
        },
        data: JSON.stringify(event),
        validateStatus:
          /* istanbul ignore next */
          (status: number) => status >= 200 && status < 500,
      })
    }
  }
}
