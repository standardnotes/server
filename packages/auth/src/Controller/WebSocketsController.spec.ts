import 'reflect-metadata'

import * as express from 'express'
import { results } from 'inversify-express-utils'

import { AddWebSocketsConnection } from '../Domain/UseCase/AddWebSocketsConnection/AddWebSocketsConnection'

import { WebSocketsController } from './WebSocketsController'
import { RemoveWebSocketsConnection } from '../Domain/UseCase/RemoveWebSocketsConnection/RemoveWebSocketsConnection'

describe('WebSocketsController', () => {
  let addWebSocketsConnection: AddWebSocketsConnection
  let removeWebSocketsConnection: RemoveWebSocketsConnection
  let request: express.Request
  let response: express.Response

  const createController = () => new WebSocketsController(addWebSocketsConnection, removeWebSocketsConnection)

  beforeEach(() => {
    addWebSocketsConnection = {} as jest.Mocked<AddWebSocketsConnection>
    addWebSocketsConnection.execute = jest.fn()

    removeWebSocketsConnection = {} as jest.Mocked<RemoveWebSocketsConnection>
    removeWebSocketsConnection.execute = jest.fn()

    request = {
      body: {
        userUuid: '1-2-3',
      },
      params: {},
      headers: {},
    } as jest.Mocked<express.Request>
    request.params.connectionId = '2-3-4'

    response = {
      locals: {},
    } as jest.Mocked<express.Response>
    response.locals.user = {
      uuid: '1-2-3',
    }
  })

  it('should persist an established web sockets connection', async () => {
    const httpResponse = await createController().storeWebSocketsConnection(request, response)

    expect(httpResponse).toBeInstanceOf(results.JsonResult)
    expect((<results.JsonResult>httpResponse).statusCode).toEqual(200)

    expect(addWebSocketsConnection.execute).toHaveBeenCalledWith({
      userUuid: '1-2-3',
      connectionId: '2-3-4',
    })
  })

  it('should remove a disconnected web sockets connection', async () => {
    const httpResponse = await createController().deleteWebSocketsConnection(request)

    expect(httpResponse).toBeInstanceOf(results.JsonResult)
    expect((<results.JsonResult>httpResponse).statusCode).toEqual(200)

    expect(removeWebSocketsConnection.execute).toHaveBeenCalledWith({
      connectionId: '2-3-4',
    })
  })
})
