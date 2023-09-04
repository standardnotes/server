import { ApiGatewayManagementApiClient, PostToConnectionCommand } from '@aws-sdk/client-apigatewaymanagementapi'
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
    @inject(TYPES.WebSockets_ApiGatewayManagementApiClient)
    private apiGatewayManagementClient: ApiGatewayManagementApiClient,
    @inject(TYPES.Logger) private logger: Logger,
  ) {}

  async send(userUuid: string, message: string): Promise<void> {
    const userConnections = await this.webSocketsConnectionRepository.findAllByUserUuid(userUuid)

    for (const connectionUuid of userConnections) {
      this.logger.debug(`Sending message to connection ${connectionUuid} for user ${userUuid}`)

      const requestParams = {
        ConnectionId: connectionUuid,
        Data: message,
      }

      const command = new PostToConnectionCommand(requestParams)

      try {
        const response = await this.apiGatewayManagementClient.send(command)

        if (response.$metadata.httpStatusCode !== 200) {
          this.logger.error(
            `Could not send message to connection ${connectionUuid} for user ${userUuid}. Response status code: ${response.$metadata.httpStatusCode}`,
          )
        }
      } catch (error) {
        this.logger.error(
          `Could not send message to connection ${connectionUuid} for user ${userUuid}. Error: ${
            (error as Error).message
          }`,
        )
      }
    }
  }
}
