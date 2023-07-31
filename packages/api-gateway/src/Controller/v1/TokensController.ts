import { Request, Response } from 'express'
import { inject } from 'inversify'
import { BaseHttpController, controller, httpPost } from 'inversify-express-utils'

import { TYPES } from '../../Bootstrap/Types'
import { ServiceProxyInterface } from '../../Service/Http/ServiceProxyInterface'
import { EndpointResolverInterface } from '../../Service/Resolver/EndpointResolverInterface'

@controller('/v1/subscription-tokens')
export class TokensController extends BaseHttpController {
  constructor(
    @inject(TYPES.ApiGateway_ServiceProxy) private httpService: ServiceProxyInterface,
    @inject(TYPES.ApiGateway_EndpointResolver) private endpointResolver: EndpointResolverInterface,
  ) {
    super()
  }

  @httpPost('/', TYPES.ApiGateway_RequiredCrossServiceTokenMiddleware)
  async createToken(request: Request, response: Response): Promise<void> {
    await this.httpService.callAuthServer(
      request,
      response,
      this.endpointResolver.resolveEndpointOrMethodIdentifier('POST', 'subscription-tokens'),
      request.body,
    )
  }
}
