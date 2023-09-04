import 'reflect-metadata'

import { WebSocketsConnectionRepositoryInterface } from '../../Domain/WebSockets/WebSocketsConnectionRepositoryInterface'
import { AxiosInstance } from 'axios'
import { Logger } from 'winston'

import { WebSocketsClientMessenger } from './WebSocketsClientMessenger'

describe('WebSocketsClientMessenger', () => {
  let connectionIds: string[]
  let webSocketsConnectionRepository: WebSocketsConnectionRepositoryInterface
  let httpClient: AxiosInstance
  let logger: Logger

  const webSocketsApiUrl = 'http://test-websockets'

  const createService = () =>
    new WebSocketsClientMessenger(webSocketsConnectionRepository, httpClient, webSocketsApiUrl, logger)

  beforeEach(() => {
    connectionIds = ['1', '2']

    webSocketsConnectionRepository = {} as jest.Mocked<WebSocketsConnectionRepositoryInterface>
    webSocketsConnectionRepository.findAllByUserUuid = jest.fn().mockReturnValue(connectionIds)

    httpClient = {} as jest.Mocked<AxiosInstance>
    httpClient.request = jest.fn().mockReturnValue({ status: 200 })

    logger = {} as jest.Mocked<Logger>
    logger.debug = jest.fn()
    logger.error = jest.fn()
  })

  it('should send a message to all user connections', async () => {
    await createService().send('1-2-3', 'message')

    expect(httpClient.request).toHaveBeenCalledTimes(connectionIds.length)
    connectionIds.map((id, index) => {
      expect(httpClient.request).toHaveBeenNthCalledWith(
        index + 1,
        expect.objectContaining({
          method: 'POST',
          url: `${webSocketsApiUrl}/${id}`,
          data: 'message',
        }),
      )
    })
  })

  it('should log an error if message could not be sent', async () => {
    httpClient.request = jest.fn().mockReturnValue({ status: 400 })

    await createService().send('1-2-3', 'message')

    expect(logger.error).toHaveBeenCalledTimes(connectionIds.length)
  })
})
