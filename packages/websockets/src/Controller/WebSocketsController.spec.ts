import 'reflect-metadata'

import { WebSocketsController } from './WebSocketsController'
import { CreateWebSocketConnectionToken } from '../Domain/UseCase/CreateWebSocketConnectionToken/CreateWebSocketConnectionToken'

describe('WebSocketsController', () => {
  let createWebSocketConnectionToken: CreateWebSocketConnectionToken

  const createController = () => new WebSocketsController(createWebSocketConnectionToken)

  beforeEach(() => {
    createWebSocketConnectionToken = {} as jest.Mocked<CreateWebSocketConnectionToken>
    createWebSocketConnectionToken.execute = jest.fn().mockReturnValue({ token: 'foobar' })
  })

  it('should create a web sockets connection token', async () => {
    const response = await createController().createConnectionToken({ userUuid: '1-2-3' })

    expect(response).toEqual({
      status: 200,
      data: { token: 'foobar' },
    })

    expect(createWebSocketConnectionToken.execute).toHaveBeenCalledWith({
      userUuid: '1-2-3',
    })
  })
})
