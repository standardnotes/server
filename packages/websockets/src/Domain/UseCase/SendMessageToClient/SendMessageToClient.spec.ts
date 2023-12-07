import {
  ApiGatewayManagementApiClient,
  ApiGatewayManagementApiServiceException,
  GoneException,
} from '@aws-sdk/client-apigatewaymanagementapi'
import { WebSocketsConnectionRepositoryInterface } from '../../WebSockets/WebSocketsConnectionRepositoryInterface'
import { SendMessageToClient } from './SendMessageToClient'
import { Logger } from 'winston'
import { Connection } from '../../Connection/Connection'
import { Timestamps, Uuid } from '@standardnotes/domain-core'

describe('SendMessageToClient', () => {
  let webSocketsConnectionRepository: WebSocketsConnectionRepositoryInterface
  let apiGatewayManagementClient: ApiGatewayManagementApiClient
  let logger: Logger

  const createUseCase = () =>
    new SendMessageToClient(webSocketsConnectionRepository, apiGatewayManagementClient, logger)

  beforeEach(() => {
    const connection = Connection.create({
      userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      connectionId: 'connection-id',
      sessionUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      timestamps: Timestamps.create(123, 123).getValue(),
    }).getValue()

    webSocketsConnectionRepository = {} as jest.Mocked<WebSocketsConnectionRepositoryInterface>
    webSocketsConnectionRepository.findAllByUserUuid = jest.fn().mockResolvedValue([connection])
    webSocketsConnectionRepository.removeConnection = jest.fn()

    apiGatewayManagementClient = {} as jest.Mocked<ApiGatewayManagementApiClient>
    apiGatewayManagementClient.send = jest.fn().mockResolvedValue({ $metadata: { httpStatusCode: 200 } })

    logger = {} as jest.Mocked<Logger>
    logger.debug = jest.fn()
    logger.error = jest.fn()
    logger.info = jest.fn()
  })

  it('sends message to all connections for a user', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      message: 'message',
    })

    expect(result.isFailed()).toBe(false)
    expect(apiGatewayManagementClient.send).toHaveBeenCalledTimes(1)
  })

  it('does not send message to originating session', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      message: 'message',
      originatingSessionUuid: '00000000-0000-0000-0000-000000000000',
    })

    expect(result.isFailed()).toBe(false)
    expect(apiGatewayManagementClient.send).toHaveBeenCalledTimes(0)
  })

  it('returns error if sending message fails', async () => {
    apiGatewayManagementClient.send = jest.fn().mockRejectedValue(new Error('error'))

    const useCase = createUseCase()

    const result = await useCase.execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      message: 'message',
    })

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toBe(
      'Could not send message to connection connection-id for user 00000000-0000-0000-0000-000000000000. Error: {}',
    )
  })

  it('returns error if the user uuid is invalid', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      userUuid: 'invalid',
      message: 'message',
    })

    expect(result.isFailed()).toBe(true)
  })

  it('return error if sending the message does not return a 200 status code', async () => {
    apiGatewayManagementClient.send = jest.fn().mockResolvedValue({ $metadata: { httpStatusCode: 500 } })

    const useCase = createUseCase()

    const result = await useCase.execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      message: 'message',
    })

    expect(result.isFailed()).toBe(true)
  })

  it('removes connection if it is gone', async () => {
    apiGatewayManagementClient.send = jest.fn().mockRejectedValue(
      new GoneException(
        new ApiGatewayManagementApiServiceException({
          name: 'test',
          $fault: 'server',
          $metadata: {},
        }),
      ),
    )

    const useCase = createUseCase()

    const result = await useCase.execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      message: 'message',
    })

    expect(result.isFailed()).toBe(false)
    expect(webSocketsConnectionRepository.removeConnection).toHaveBeenCalledTimes(1)
  })
})
