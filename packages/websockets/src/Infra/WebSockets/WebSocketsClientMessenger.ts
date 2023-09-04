import { AxiosInstance } from 'axios'
import { Logger } from 'winston'
import { inject, injectable } from 'inversify'

import TYPES from '../../Bootstrap/Types'
import { WebSocketsConnectionRepositoryInterface } from '../../Domain/WebSockets/WebSocketsConnectionRepositoryInterface'
import { ClientMessengerInterface } from '../../Client/ClientMessengerInterface'

@injectable()
export class WebSocketsClientMessenger implements ClientMessengerInterface {
  constructor(
    @inject(TYPES.WebSocketsConnectionRepository)
    private webSocketsConnectionRepository: WebSocketsConnectionRepositoryInterface,
    @inject(TYPES.HTTPClient) private httpClient: AxiosInstance,
    @inject(TYPES.WEBSOCKETS_API_URL) private webSocketsApiUrl: string,
    @inject(TYPES.Logger) private logger: Logger,
  ) {}

  async send(userUuid: string, message: string): Promise<void> {
    const userConnections = await this.webSocketsConnectionRepository.findAllByUserUuid(userUuid)

    for (const connectionUuid of userConnections) {
      this.logger.debug(`Sending message to connection ${connectionUuid} for user ${userUuid}`)
      const response = await this.httpClient.request({
        method: 'POST',
        url: `${this.webSocketsApiUrl}/${connectionUuid}`,
        headers: {
          Accept: 'text/plain',
          'Content-Type': 'text/plain',
        },
        data: message,
        validateStatus:
          /* istanbul ignore next */
          (status: number) => status >= 200 && status < 500,
      })
      if (response.status !== 200) {
        this.logger.error(
          `Could not send message to connection ${connectionUuid} for user ${userUuid}. Response status code: ${response.status}. Response body: ${response.data}`,
        )
      }
    }
  }
}
