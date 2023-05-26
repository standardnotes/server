import { ControllerContainerInterface } from '@standardnotes/domain-core'
import { TokenDecoderInterface, WebSocketConnectionTokenData } from '@standardnotes/security'

import { CreateCrossServiceToken } from '../../Domain/UseCase/CreateCrossServiceToken/CreateCrossServiceToken'
import { InversifyExpressWebSocketsController } from '../InversifyExpressUtils/InversifyExpressWebSocketsController'

export class HomeServerWebSocketsController extends InversifyExpressWebSocketsController {
  constructor(
    override createCrossServiceToken: CreateCrossServiceToken,
    override tokenDecoder: TokenDecoderInterface<WebSocketConnectionTokenData>,
    private controllerContainer: ControllerContainerInterface,
  ) {
    super(createCrossServiceToken, tokenDecoder)

    this.controllerContainer.register('auth.webSockets.validateToken', this.validateToken.bind(this))
  }
}
