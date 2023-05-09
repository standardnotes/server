import { Request, Response } from 'express'
import { BaseHttpController, controller, httpDelete, httpGet, httpPatch, httpPost } from 'inversify-express-utils'
import { inject } from 'inversify'
import { TYPES } from '../../Bootstrap/Types'
import { HttpServiceInterface } from '../../Service/Http/HttpServiceInterface'

@controller('/v2')
export class PaymentsControllerV2 extends BaseHttpController {
  constructor(@inject(TYPES.HTTPService) private httpService: HttpServiceInterface) {
    super()
  }

  @httpGet('/subscriptions')
  async getSubscriptionsWithFeatures(request: Request, response: Response): Promise<void> {
    await this.httpService.callPaymentsServer(request, response, 'api/subscriptions/features', request.body)
  }

  @httpGet('/subscriptions/tailored', TYPES.SubscriptionTokenAuthMiddleware)
  async getTailoredSubscriptionsWithFeatures(request: Request, response: Response): Promise<void> {
    await this.httpService.callPaymentsServer(request, response, 'api/subscriptions/features', request.body)
  }

  @httpGet('/subscriptions/deltas', TYPES.SubscriptionTokenAuthMiddleware)
  async getSubscriptionDeltasForChangingPlan(request: Request, response: Response): Promise<void> {
    await this.httpService.callPaymentsServer(request, response, 'api/subscriptions/deltas', request.body)
  }

  @httpPost('/subscriptions/deltas/apply', TYPES.SubscriptionTokenAuthMiddleware)
  async applySubscriptionDelta(request: Request, response: Response): Promise<void> {
    await this.httpService.callPaymentsServer(request, response, 'api/subscriptions/deltas/apply', request.body)
  }

  @httpPost('/subscriptions/change-payment-method', TYPES.SubscriptionTokenAuthMiddleware)
  async changePaymentMethod(request: Request, response: Response): Promise<void> {
    await this.httpService.callPaymentsServer(
      request,
      response,
      'api/subscriptions/change-payment-method',
      request.body,
    )
  }

  @httpGet('/subscriptions/:subscriptionId', TYPES.SubscriptionTokenAuthMiddleware)
  async getSubscription(request: Request, response: Response): Promise<void> {
    await this.httpService.callPaymentsServer(
      request,
      response,
      `api/subscriptions/${request.params.subscriptionId}`,
      request.body,
    )
  }

  @httpDelete('/subscriptions/:subscriptionId', TYPES.SubscriptionTokenAuthMiddleware)
  async cancelSubscription(request: Request, response: Response): Promise<void> {
    await this.httpService.callPaymentsServer(
      request,
      response,
      `api/subscriptions/${request.params.subscriptionId}`,
      request.body,
    )
  }

  @httpPatch('/subscriptions/:subscriptionId', TYPES.SubscriptionTokenAuthMiddleware)
  async updateSubscription(request: Request, response: Response): Promise<void> {
    await this.httpService.callPaymentsServer(
      request,
      response,
      `api/subscriptions/${request.params.subscriptionId}`,
      request.body,
    )
  }
}
