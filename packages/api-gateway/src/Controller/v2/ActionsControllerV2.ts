import { Request, Response } from 'express'
import { inject } from 'inversify'
import { BaseHttpController, controller, httpPost } from 'inversify-express-utils'

import { TYPES } from '../../Bootstrap/Types'
import { ServiceProxyInterface } from '../../Service/Http/ServiceProxyInterface'
import { EndpointResolverInterface } from '../../Service/Resolver/EndpointResolverInterface'

@controller('/v2')
export class ActionsControllerV2 extends BaseHttpController {
  constructor(
    @inject(TYPES.ServiceProxy) private serviceProxy: ServiceProxyInterface,
    @inject(TYPES.EndpointResolver) private endpointResolver: EndpointResolverInterface,
  ) {
    super()
  }

  @httpPost('/login')
  async login(request: Request, response: Response): Promise<void> {
    await this.serviceProxy.callAuthServer(
      request,
      response,
      this.endpointResolver.resolveEndpointOrMethodIdentifier('POST', 'auth/pkce_sign_in'),
      request.body,
    )
  }

  @httpPost('/login-params', TYPES.OptionalCrossServiceTokenMiddleware)
  async loginParams(request: Request, response: Response): Promise<void> {
    await this.serviceProxy.callAuthServer(
      request,
      response,
      this.endpointResolver.resolveEndpointOrMethodIdentifier('POST', 'auth/pkce_params'),
      request.body,
    )
  }
}
