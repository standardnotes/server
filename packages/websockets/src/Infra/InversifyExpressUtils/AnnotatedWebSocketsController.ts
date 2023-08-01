import { WebSocketServerInterface } from '@standardnotes/api'
import { Request, Response } from 'express'
import { inject } from 'inversify'
import {
  BaseHttpController,
  controller,
  httpDelete,
  httpPost,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  results,
} from 'inversify-express-utils'
import TYPES from '../../Bootstrap/Types'
import { AddWebSocketsConnection } from '../../Domain/UseCase/AddWebSocketsConnection/AddWebSocketsConnection'
import { RemoveWebSocketsConnection } from '../../Domain/UseCase/RemoveWebSocketsConnection/RemoveWebSocketsConnection'

@controller('/sockets')
export class AnnotatedWebSocketsController extends BaseHttpController {
  constructor(
    @inject(TYPES.AddWebSocketsConnection) private addWebSocketsConnection: AddWebSocketsConnection,
    @inject(TYPES.RemoveWebSocketsConnection) private removeWebSocketsConnection: RemoveWebSocketsConnection,
    @inject(TYPES.WebSocketsController) private webSocketsController: WebSocketServerInterface,
  ) {
    super()
  }

  @httpPost('/tokens', TYPES.ApiGatewayAuthMiddleware)
  async createConnectionToken(_request: Request, response: Response): Promise<results.JsonResult> {
    const result = await this.webSocketsController.createConnectionToken({
      userUuid: response.locals.user.uuid,
    })

    return this.json(result.data, result.status)
  }

  @httpPost('/connections/:connectionId', TYPES.ApiGatewayAuthMiddleware)
  async storeWebSocketsConnection(
    request: Request,
    response: Response,
  ): Promise<results.JsonResult | results.BadRequestErrorMessageResult> {
    await this.addWebSocketsConnection.execute({
      userUuid: response.locals.user.uuid,
      connectionId: request.params.connectionId,
    })

    return this.json({ success: true })
  }

  @httpDelete('/connections/:connectionId')
  async deleteWebSocketsConnection(
    request: Request,
  ): Promise<results.JsonResult | results.BadRequestErrorMessageResult> {
    await this.removeWebSocketsConnection.execute({ connectionId: request.params.connectionId })

    return this.json({ success: true })
  }
}
