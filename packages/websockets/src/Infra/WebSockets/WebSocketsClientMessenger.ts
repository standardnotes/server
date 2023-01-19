import { AxiosInstance } from 'axios'
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
  ) {}

  async send(userUuid: string, message: string): Promise<void> {
    const userConnections = await this.webSocketsConnectionRepository.findAllByUserUuid(userUuid)

    for (const connectionUuid of userConnections) {
      await this.httpClient.request({
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
    }
  }
}
