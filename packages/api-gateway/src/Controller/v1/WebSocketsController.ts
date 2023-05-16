import { Request, Response } from 'express'
import { inject } from 'inversify'
import { BaseHttpController, controller, httpDelete, httpPost } from 'inversify-express-utils'
import { Logger } from 'winston'

import { TYPES } from '../../Bootstrap/Types'
import { ServiceProxyInterface } from '../../Service/Http/ServiceProxyInterface'
import { EndpointResolverInterface } from '../../Service/Resolver/EndpointResolverInterface'

@controller('/v1/sockets')
export class WebSocketsController extends BaseHttpController {
  constructor(
    @inject(TYPES.ServiceProxy) private httpService: ServiceProxyInterface,
    @inject(TYPES.EndpointResolver) private endpointResolver: EndpointResolverInterface,
    @inject(TYPES.Logger) private logger: Logger,
  ) {
    super()
  }

  @httpPost('/tokens', TYPES.AuthMiddleware)
  async createWebSocketConnectionToken(request: Request, response: Response): Promise<void> {
    await this.httpService.callWebSocketServer(
      request,
      response,
      this.endpointResolver.resolveEndpointOrMethodIdentifier('POST', 'sockets/tokens'),
      request.body,
    )
  }

  @httpPost('/connections', TYPES.WebSocketAuthMiddleware)
  async createWebSocketConnection(request: Request, response: Response): Promise<void> {
    if (!request.headers.connectionid) {
      this.logger.error('Could not create a websocket connection. Missing connection id header.')

      response.status(400).send('Missing connection id in the request')

      return
    }

    await this.httpService.callWebSocketServer(
      request,
      response,
      this.endpointResolver.resolveEndpointOrMethodIdentifier(
        'POST',
        'sockets/connections/:connectionId',
        request.headers.connectionid as string,
      ),
      request.body,
    )
  }

  @httpDelete('/connections')
  async deleteWebSocketConnection(request: Request, response: Response): Promise<void> {
    if (!request.headers.connectionid) {
      this.logger.error('Could not delete a websocket connection. Missing connection id header.')

      response.status(400).send('Missing connection id in the request')

      return
    }

    await this.httpService.callWebSocketServer(
      request,
      response,
      this.endpointResolver.resolveEndpointOrMethodIdentifier(
        'DELETE',
        'sockets/connections/:connectionId',
        request.headers.connectionid as string,
      ),
      request.body,
    )
  }
}
