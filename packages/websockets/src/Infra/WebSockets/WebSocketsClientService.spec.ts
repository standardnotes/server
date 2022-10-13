import 'reflect-metadata'

import { WebSocketsConnectionRepositoryInterface } from '../../Domain/WebSockets/WebSocketsConnectionRepositoryInterface'
import { AxiosInstance } from 'axios'

import { WebSocketsClientMessenger } from './WebSocketsClientMessenger'

describe('WebSocketsClientMessenger', () => {
  let connectionIds: string[]
  let webSocketsConnectionRepository: WebSocketsConnectionRepositoryInterface
  let httpClient: AxiosInstance

  const webSocketsApiUrl = 'http://test-websockets'

  const createService = () =>
    new WebSocketsClientMessenger(webSocketsConnectionRepository, httpClient, webSocketsApiUrl)

  beforeEach(() => {
    connectionIds = ['1', '2']

    webSocketsConnectionRepository = {} as jest.Mocked<WebSocketsConnectionRepositoryInterface>
    webSocketsConnectionRepository.findAllByUserUuid = jest.fn().mockReturnValue(connectionIds)

    httpClient = {} as jest.Mocked<AxiosInstance>
    httpClient.request = jest.fn()
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
})
