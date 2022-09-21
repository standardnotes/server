import { WebSocketServerInterface } from '@standardnotes/api'
import { ErrorTag } from '@standardnotes/common'
import { TokenDecoderInterface, WebSocketConnectionTokenData } from '@standardnotes/security'
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
import { CreateCrossServiceToken } from '../../Domain/UseCase/CreateCrossServiceToken/CreateCrossServiceToken'
import { RemoveWebSocketsConnection } from '../../Domain/UseCase/RemoveWebSocketsConnection/RemoveWebSocketsConnection'

@controller('/sockets')
export class InversifyExpressWebSocketsController extends BaseHttpController {
  constructor(
    @inject(TYPES.AddWebSocketsConnection) private addWebSocketsConnection: AddWebSocketsConnection,
    @inject(TYPES.RemoveWebSocketsConnection) private removeWebSocketsConnection: RemoveWebSocketsConnection,
    @inject(TYPES.CreateCrossServiceToken) private createCrossServiceToken: CreateCrossServiceToken,
    @inject(TYPES.WebSocketsController) private webSocketsController: WebSocketServerInterface,
    @inject(TYPES.WebSocketConnectionTokenDecoder)
    private tokenDecoder: TokenDecoderInterface<WebSocketConnectionTokenData>,
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

  @httpPost('/tokens/validate')
  async validateToken(request: Request): Promise<results.JsonResult> {
    if (!request.headers.authorization) {
      return this.json(
        {
          error: {
            tag: ErrorTag.AuthInvalid,
            message: 'Invalid authorization token.',
          },
        },
        401,
      )
    }

    const token: WebSocketConnectionTokenData | undefined = this.tokenDecoder.decodeToken(request.headers.authorization)

    if (token === undefined) {
      return this.json(
        {
          error: {
            tag: ErrorTag.AuthInvalid,
            message: 'Invalid authorization token.',
          },
        },
        401,
      )
    }

    const result = await this.createCrossServiceToken.execute({
      userUuid: token.userUuid,
    })

    return this.json({ authToken: result.token })
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
