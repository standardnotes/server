import 'reflect-metadata'
import { Logger } from 'winston'
import { WebSocketsConnectionRepositoryInterface } from '../../WebSockets/WebSocketsConnectionRepositoryInterface'

import { RemoveWebSocketsConnection } from './RemoveWebSocketsConnection'

describe('RemoveWebSocketsConnection', () => {
  let webSocketsConnectionRepository: WebSocketsConnectionRepositoryInterface
  let logger: Logger

  const createUseCase = () => new RemoveWebSocketsConnection(webSocketsConnectionRepository, logger)

  beforeEach(() => {
    webSocketsConnectionRepository = {} as jest.Mocked<WebSocketsConnectionRepositoryInterface>
    webSocketsConnectionRepository.removeConnection = jest.fn()

    logger = {} as jest.Mocked<Logger>
    logger.debug = jest.fn()
    logger.error = jest.fn()
  })

  it('should remove a web sockets connection', async () => {
    const result = await createUseCase().execute({ connectionId: '2-3-4' })

    expect(webSocketsConnectionRepository.removeConnection).toHaveBeenCalledWith('2-3-4')
    expect(result.isFailed()).toBe(false)
  })

  it('should return a failure if the web sockets connection could not be removed', async () => {
    webSocketsConnectionRepository.removeConnection = jest
      .fn()
      .mockRejectedValueOnce(new Error('Could not remove connection'))

    const result = await createUseCase().execute({ connectionId: '2-3-4' })

    expect(result.isFailed()).toBe(true)
  })
})
