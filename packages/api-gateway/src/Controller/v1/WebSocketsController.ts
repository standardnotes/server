import { Request, Response } from 'express'
import { inject } from 'inversify'
import { BaseHttpController, controller, httpDelete, httpPost } from 'inversify-express-utils'
import { Logger } from 'winston'

import TYPES from '../../Bootstrap/Types'
import { HttpServiceInterface } from '../../Service/Http/HttpServiceInterface'

@controller('/v1/sockets')
export class WebSocketsController extends BaseHttpController {
  constructor(
    @inject(TYPES.HTTPService) private httpService: HttpServiceInterface,
    @inject(TYPES.Logger) private logger: Logger,
  ) {
    super()
  }

  @httpPost('/tokens', TYPES.AuthMiddleware)
  async createWebSocketConnectionToken(request: Request, response: Response): Promise<void> {
    await this.httpService.callAuthServer(request, response, 'sockets/tokens', request.body)
  }

  @httpPost('/', TYPES.WebSocketAuthMiddleware)
  async createWebSocketConnection(request: Request, response: Response): Promise<void> {
    if (!request.headers.connectionid) {
      this.logger.error('Could not create a websocket connection. Missing connection id header.')

      response.status(400).send('Missing connection id in the request')

      return
    }

    await this.httpService.callAuthServer(request, response, `sockets/${request.headers.connectionid}`, request.body)
  }

  @httpDelete('/')
  async deleteWebSocketConnection(request: Request, response: Response): Promise<void> {
    if (!request.headers.connectionid) {
      this.logger.error('Could not delete a websocket connection. Missing connection id header.')

      response.status(400).send('Missing connection id in the request')

      return
    }

    await this.httpService.callAuthServer(request, response, `sockets/${request.headers.connectionid}`, request.body)
  }
}
