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
  })

  it('should remove a web sockets connection', async () => {
    await createUseCase().execute({ connectionId: '2-3-4' })

    expect(webSocketsConnectionRepository.removeConnection).toHaveBeenCalledWith('2-3-4')
  })
})
