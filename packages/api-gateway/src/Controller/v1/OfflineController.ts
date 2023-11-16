import { Request, Response } from 'express'
import { inject } from 'inversify'
import { BaseHttpController, controller, httpGet, httpPost } from 'inversify-express-utils'

import { TYPES } from '../../Bootstrap/Types'
import { ServiceProxyInterface } from '../../Service/Proxy/ServiceProxyInterface'
import { EndpointResolverInterface } from '../../Service/Resolver/EndpointResolverInterface'

@controller('/v1/offline')
export class OfflineController extends BaseHttpController {
  constructor(
    @inject(TYPES.ApiGateway_ServiceProxy) private httpService: ServiceProxyInterface,
    @inject(TYPES.ApiGateway_EndpointResolver) private endpointResolver: EndpointResolverInterface,
  ) {
    super()
  }

  @httpGet('/features')
  async getOfflineFeatures(request: Request, response: Response): Promise<void> {
    await this.httpService.callAuthServer(
      request,
      response,
      this.endpointResolver.resolveEndpointOrMethodIdentifier('GET', 'offline/features'),
      request.body,
    )
  }

  @httpPost('/subscription-tokens')
  async createOfflineSubscriptionToken(request: Request, response: Response): Promise<void> {
    await this.httpService.callAuthServer(
      request,
      response,
      this.endpointResolver.resolveEndpointOrMethodIdentifier('POST', 'offline/subscription-tokens'),
      request.body,
    )
  }

  @httpPost('/payments/stripe-setup-intent')
  async createStripeSetupIntent(request: Request, response: Response): Promise<void> {
    await this.httpService.callPaymentsServer(
      request,
      response,
      'api/pro_users/stripe-setup-intent/offline',
      request.body,
    )
  }
}
