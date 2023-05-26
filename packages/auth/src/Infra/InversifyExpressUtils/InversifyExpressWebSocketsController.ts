import { ErrorTag } from '@standardnotes/responses'
import { TokenDecoderInterface, WebSocketConnectionTokenData } from '@standardnotes/security'
import { Request } from 'express'
import {
  BaseHttpController,
  controller,
  httpPost,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  results,
} from 'inversify-express-utils'
import { CreateCrossServiceToken } from '../../Domain/UseCase/CreateCrossServiceToken/CreateCrossServiceToken'
import { inject } from 'inversify'
import TYPES from '../../Bootstrap/Types'

@controller('/sockets')
export class InversifyExpressWebSocketsController extends BaseHttpController {
  constructor(
    @inject(TYPES.Auth_CreateCrossServiceToken) protected createCrossServiceToken: CreateCrossServiceToken,
    @inject(TYPES.Auth_WebSocketConnectionTokenDecoder)
    protected tokenDecoder: TokenDecoderInterface<WebSocketConnectionTokenData>,
  ) {
    super()
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
}
