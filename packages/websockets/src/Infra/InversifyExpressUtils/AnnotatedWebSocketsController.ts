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
import { CreateWebSocketConnectionToken } from '../../Domain/UseCase/CreateWebSocketConnectionToken/CreateWebSocketConnectionToken'

@controller('/sockets')
export class AnnotatedWebSocketsController extends BaseHttpController {
  constructor(
    @inject(TYPES.AddWebSocketsConnection) private addWebSocketsConnection: AddWebSocketsConnection,
    @inject(TYPES.RemoveWebSocketsConnection) private removeWebSocketsConnection: RemoveWebSocketsConnection,
    @inject(TYPES.CreateWebSocketConnectionToken)
    private createWebSocketConnectionToken: CreateWebSocketConnectionToken,
  ) {
    super()
  }

  @httpPost('/tokens', TYPES.ApiGatewayAuthMiddleware)
  async createConnectionToken(_request: Request, response: Response): Promise<results.JsonResult> {
    const result = await this.createWebSocketConnectionToken.execute({
      userUuid: response.locals.user.uuid,
      sessionUuid: response.locals.session.uuid,
    })

    return this.json(result)
  }

  @httpPost('/connections/:connectionId', TYPES.ApiGatewayAuthMiddleware)
  async storeWebSocketsConnection(
    request: Request,
    response: Response,
  ): Promise<results.OkResult | results.BadRequestResult> {
    const result = await this.addWebSocketsConnection.execute({
      userUuid: response.locals.user.uuid,
      sessionUuid: response.locals.session.uuid,
      connectionId: request.params.connectionId,
    })

    if (result.isFailed()) {
      return this.badRequest()
    }

    return this.ok()
  }

  @httpDelete('/connections/:connectionId')
  async deleteWebSocketsConnection(request: Request): Promise<results.OkResult | results.BadRequestResult> {
    const result = await this.removeWebSocketsConnection.execute({ connectionId: request.params.connectionId })

    if (result.isFailed()) {
      return this.badRequest()
    }

    return this.ok()
  }
}
