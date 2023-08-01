import { ControllerContainerInterface } from '@standardnotes/domain-core'
import { TokenDecoderInterface, WebSocketConnectionTokenData } from '@standardnotes/security'
import { Request } from 'express'
import { BaseHttpController, results } from 'inversify-express-utils'

import { CreateCrossServiceToken } from '../../../Domain/UseCase/CreateCrossServiceToken/CreateCrossServiceToken'
import { ErrorTag } from '@standardnotes/responses'

export class BaseWebSocketsController extends BaseHttpController {
  constructor(
    protected createCrossServiceToken: CreateCrossServiceToken,
    protected tokenDecoder: TokenDecoderInterface<WebSocketConnectionTokenData>,
    private controllerContainer?: ControllerContainerInterface,
  ) {
    super()

    if (this.controllerContainer !== undefined) {
      this.controllerContainer.register('auth.webSockets.validateToken', this.validateToken.bind(this))
    }
  }

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
}
