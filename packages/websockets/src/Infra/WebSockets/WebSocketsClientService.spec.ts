import 'reflect-metadata'

import { ApiGatewayManagementApiClient } from '@aws-sdk/client-apigatewaymanagementapi'

import { WebSocketsConnectionRepositoryInterface } from '../../Domain/WebSockets/WebSocketsConnectionRepositoryInterface'
import { Logger } from 'winston'

import { WebSocketsClientMessenger } from './WebSocketsClientMessenger'

describe('WebSocketsClientMessenger', () => {
  let connectionIds: string[]
  let webSocketsConnectionRepository: WebSocketsConnectionRepositoryInterface
  let apiGatewayManagementClient: ApiGatewayManagementApiClient
  let logger: Logger

  const createService = () =>
    new WebSocketsClientMessenger(webSocketsConnectionRepository, apiGatewayManagementClient, logger)

  beforeEach(() => {
    connectionIds = ['1', '2']

    webSocketsConnectionRepository = {} as jest.Mocked<WebSocketsConnectionRepositoryInterface>
    webSocketsConnectionRepository.findAllByUserUuid = jest.fn().mockReturnValue(connectionIds)

    apiGatewayManagementClient = {} as jest.Mocked<ApiGatewayManagementApiClient>
    apiGatewayManagementClient.send = jest.fn().mockReturnValue({ $metadata: { httpStatusCode: 200 } })

    logger = {} as jest.Mocked<Logger>
    logger.debug = jest.fn()
    logger.error = jest.fn()
  })

  it('should send a message to all user connections', async () => {
    await createService().send('1-2-3', 'message')

    expect(apiGatewayManagementClient.send).toHaveBeenCalledTimes(connectionIds.length)
  })

  it('should log an error if message could not be sent', async () => {
    apiGatewayManagementClient.send = jest.fn().mockReturnValue({ $metadata: { httpStatusCode: 500 } })

    await createService().send('1-2-3', 'message')

    expect(logger.error).toHaveBeenCalledTimes(connectionIds.length)
  })

  it('should log an error if message sending throws error', async () => {
    apiGatewayManagementClient.send = jest.fn().mockRejectedValue(new Error('error'))

    await createService().send('1-2-3', 'message')

    expect(logger.error).toHaveBeenCalledTimes(connectionIds.length)
  })
})
