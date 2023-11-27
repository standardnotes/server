import { Result, UseCaseInterface, Uuid } from '@standardnotes/domain-core'
import { ApiGatewayManagementApiClient, PostToConnectionCommand } from '@aws-sdk/client-apigatewaymanagementapi'
import { Logger } from 'winston'

import { SendMessageToClientDTO } from './SendMessageToClientDTO'
import { WebSocketsConnectionRepositoryInterface } from '../../WebSockets/WebSocketsConnectionRepositoryInterface'

export class SendMessageToClient implements UseCaseInterface<void> {
  constructor(
    private webSocketsConnectionRepository: WebSocketsConnectionRepositoryInterface,
    private apiGatewayManagementClient: ApiGatewayManagementApiClient,
    private logger: Logger,
  ) {}

  async execute(dto: SendMessageToClientDTO): Promise<Result<void>> {
    const userUuidOrError = Uuid.create(dto.userUuid)
    if (userUuidOrError.isFailed()) {
      return Result.fail(userUuidOrError.getError())
    }
    const userUuid = userUuidOrError.getValue()

    const userConnections = await this.webSocketsConnectionRepository.findAllByUserUuid(userUuid)

    for (const connection of userConnections) {
      if (dto.originatingSessionUuid && connection.props.sessionUuid.value === dto.originatingSessionUuid) {
        continue
      }

      this.logger.debug(`Sending message to connection ${connection.props.connectionId} for user ${userUuid.value}`)

      const requestParams = {
        ConnectionId: connection.props.connectionId,
        Data: dto.message,
      }

      const command = new PostToConnectionCommand(requestParams)

      try {
        const response = await this.apiGatewayManagementClient.send(command)

        if (response.$metadata.httpStatusCode !== 200) {
          return Result.fail(
            `Could not send message to connection ${connection.props.connectionId} for user ${userUuid.value}. Response status code: ${response.$metadata.httpStatusCode}`,
          )
        }
      } catch (error) {
        return Result.fail(
          `Could not send message to connection ${connection.props.connectionId} for user ${userUuid.value}. Error: ${
            (error as Error).message
          }`,
        )
      }
    }

    return Result.ok()
  }
}
