import { Logger } from 'winston'
import { TimerInterface } from '@standardnotes/time'
import { WebSocketsConnectionRepositoryInterface } from '../../WebSockets/WebSocketsConnectionRepositoryInterface'

import { AddWebSocketsConnection } from './AddWebSocketsConnection'

describe('AddWebSocketsConnection', () => {
  let webSocketsConnectionRepository: WebSocketsConnectionRepositoryInterface
  let timer: TimerInterface
  let logger: Logger

  const createUseCase = () => new AddWebSocketsConnection(webSocketsConnectionRepository, timer, logger)

  beforeEach(() => {
    webSocketsConnectionRepository = {} as jest.Mocked<WebSocketsConnectionRepositoryInterface>
    webSocketsConnectionRepository.saveConnection = jest.fn()

    logger = {} as jest.Mocked<Logger>
    logger.debug = jest.fn()
    logger.error = jest.fn()

    timer = {} as jest.Mocked<TimerInterface>
    timer.getTimestampInMicroseconds = jest.fn().mockReturnValue(123)
  })

  it('should save a web sockets connection for a user for further communication', async () => {
    const result = await createUseCase().execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      sessionUuid: '00000000-0000-0000-0000-000000000000',
      connectionId: '2-3-4',
    })

    expect(result.isFailed()).toBe(false)
  })

  it('should return a failure if the web sockets connection could not be saved', async () => {
    webSocketsConnectionRepository.saveConnection = jest
      .fn()
      .mockRejectedValueOnce(new Error('Could not save connection'))

    const result = await createUseCase().execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      sessionUuid: '00000000-0000-0000-0000-000000000000',
      connectionId: '2-3-4',
    })

    expect(result.isFailed()).toBe(true)
  })

  it('should return failure if the user uuid is invalid', async () => {
    const result = await createUseCase().execute({
      userUuid: 'invalid',
      sessionUuid: '00000000-0000-0000-0000-000000000000',
      connectionId: '2-3-4',
    })

    expect(result.isFailed()).toBe(true)
  })

  it('should return error if the session uuid is invalid', async () => {
    const result = await createUseCase().execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      sessionUuid: 'invalid',
      connectionId: '2-3-4',
    })

    expect(result.isFailed()).toBe(true)
  })
})
