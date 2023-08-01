import { TokenDecoderInterface, WebSocketConnectionTokenData } from '@standardnotes/security'
import { Request } from 'express'
import {
  controller,
  httpPost,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  results,
} from 'inversify-express-utils'
import { CreateCrossServiceToken } from '../../Domain/UseCase/CreateCrossServiceToken/CreateCrossServiceToken'
import { inject } from 'inversify'
import TYPES from '../../Bootstrap/Types'
import { BaseWebSocketsController } from './Base/BaseWebSocketsController'

@controller('/sockets')
export class AnnotatedWebSocketsController extends BaseWebSocketsController {
  constructor(
    @inject(TYPES.Auth_CreateCrossServiceToken) override createCrossServiceToken: CreateCrossServiceToken,
    @inject(TYPES.Auth_WebSocketConnectionTokenDecoder)
    override tokenDecoder: TokenDecoderInterface<WebSocketConnectionTokenData>,
  ) {
    super(createCrossServiceToken, tokenDecoder)
  }

  @httpPost('/tokens/validate')
  override async validateToken(request: Request): Promise<results.JsonResult> {
    return super.validateToken(request)
  }
}
