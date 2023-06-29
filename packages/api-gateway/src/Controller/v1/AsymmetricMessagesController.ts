import { Request, Response } from 'express'
import { inject } from 'inversify'
import { BaseHttpController, controller, all } from 'inversify-express-utils'
import { TYPES } from '../../Bootstrap/Types'
import { ServiceProxyInterface } from '../../Service/Http/ServiceProxyInterface'

@controller('/v1/asymmetric-messages')
export class AsymmetricMessagesController extends BaseHttpController {
  constructor(@inject(TYPES.ServiceProxy) private serviceProxy: ServiceProxyInterface) {
    super()
  }

  @all('*', TYPES.RequiredCrossServiceTokenMiddleware)
  async subscriptions(request: Request, response: Response): Promise<void> {
    await this.serviceProxy.callSyncingServer(request, response, request.path.replace('/v1/', ''), request.body)
  }
}
