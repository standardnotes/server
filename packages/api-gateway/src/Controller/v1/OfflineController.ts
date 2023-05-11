import { Request, Response } from 'express'
import { inject } from 'inversify'
import { BaseHttpController, controller, httpGet, httpPost } from 'inversify-express-utils'

import { TYPES } from '../../Bootstrap/Types'
import { ServiceProxyInterface } from '../../Service/Http/ServiceProxyInterface'

@controller('/v1/offline')
export class OfflineController extends BaseHttpController {
  constructor(@inject(TYPES.ServiceProxy) private httpService: ServiceProxyInterface) {
    super()
  }

  @httpGet('/features')
  async getOfflineFeatures(request: Request, response: Response): Promise<void> {
    await this.httpService.callAuthServer(request, response, 'offline/features', request.body)
  }

  @httpPost('/subscription-tokens')
  async createOfflineSubscriptionToken(request: Request, response: Response): Promise<void> {
    await this.httpService.callAuthServer(request, response, 'offline/subscription-tokens', request.body)
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
