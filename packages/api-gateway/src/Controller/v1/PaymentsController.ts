import { Request, Response } from 'express'
import { inject } from 'inversify'
import { all, BaseHttpController, controller, httpDelete, httpGet, httpPost } from 'inversify-express-utils'
import { TYPES } from '../../Bootstrap/Types'
import { ServiceProxyInterface } from '../../Service/Proxy/ServiceProxyInterface'

@controller('/v1')
export class PaymentsController extends BaseHttpController {
  constructor(@inject(TYPES.ApiGateway_ServiceProxy) private httpService: ServiceProxyInterface) {
    super()
  }

  @httpGet('/downloads')
  async downloads(request: Request, response: Response): Promise<void> {
    await this.httpService.callPaymentsServer(request, response, 'api/downloads', request.body)
  }

  @httpGet('/downloads/download-info')
  async downloadInfo(request: Request, response: Response): Promise<void> {
    await this.httpService.callPaymentsServer(request, response, 'api/downloads/download-info', request.body)
  }

  @httpGet('/downloads/platforms')
  async platformDownloads(request: Request, response: Response): Promise<void> {
    await this.httpService.callPaymentsServer(request, response, 'api/downloads/platforms', request.body)
  }

  @httpGet('/help/categories')
  async categoriesHelp(request: Request, response: Response): Promise<void> {
    await this.httpService.callPaymentsServer(request, response, 'api/help/categories', request.body)
  }

  @httpGet('/knowledge/categories')
  async categoriesKnowledge(request: Request, response: Response): Promise<void> {
    await this.httpService.callPaymentsServer(request, response, 'api/knowledge/categories', request.body)
  }

  @httpGet('/extensions')
  async extensions(request: Request, response: Response): Promise<void> {
    await this.httpService.callPaymentsServer(request, response, 'api/extensions', request.body)
  }

  @httpPost('/subscriptions/tiered', TYPES.ApiGateway_SubscriptionTokenAuthMiddleware)
  async createTieredSubscription(request: Request, response: Response): Promise<void> {
    await this.httpService.callPaymentsServer(request, response, 'api/subscriptions/tiered', request.body)
  }

  @httpPost('/subscriptions/apple_iap_confirm', TYPES.ApiGateway_SubscriptionTokenAuthMiddleware)
  async appleIAPConfirm(request: Request, response: Response): Promise<void> {
    await this.httpService.callPaymentsServer(request, response, 'api/subscriptions/apple_iap_confirm', request.body)
  }

  @all('/subscriptions(/*)?')
  async subscriptions(request: Request, response: Response): Promise<void> {
    await this.httpService.callPaymentsServer(request, response, request.path.replace('v1', 'api'), request.body)
  }

  @httpGet('/reset/validate')
  async validateReset(request: Request, response: Response): Promise<void> {
    await this.httpService.callPaymentsServer(request, response, 'api/reset/validate', request.body)
  }

  @httpDelete('/reset')
  async reset(request: Request, response: Response): Promise<void> {
    await this.httpService.callPaymentsServer(request, response, 'api/reset', request.body)
  }

  @httpPost('/reset')
  async resetRequest(request: Request, response: Response): Promise<void> {
    await this.httpService.callPaymentsServer(request, response, 'api/reset', request.body)
  }

  @httpPost('/user-registration')
  async userRegistration(request: Request, response: Response): Promise<void> {
    await this.httpService.callPaymentsServer(request, response, 'admin/events/registration', request.body)
  }

  @httpPost('/admin/auth/login')
  async adminLogin(request: Request, response: Response): Promise<void> {
    await this.httpService.callPaymentsServer(request, response, 'admin/auth/login', request.body)
  }

  @httpPost('/admin/auth/logout')
  async adminLogout(request: Request, response: Response): Promise<void> {
    await this.httpService.callPaymentsServer(request, response, 'admin/auth/logout', request.body)
  }

  @httpPost('/students')
  async students(request: Request, response: Response): Promise<void> {
    await this.httpService.callPaymentsServer(request, response, 'api/students', request.body)
  }

  @httpPost('/students/:token/approve')
  async studentsApprove(request: Request, response: Response): Promise<void> {
    await this.httpService.callPaymentsServer(
      request,
      response,
      `api/students/${request.params.token}/approve`,
      request.body,
    )
  }

  @httpPost('/email_subscriptions/:token/less')
  async subscriptionsLess(request: Request, response: Response): Promise<void> {
    await this.httpService.callPaymentsServer(
      request,
      response,
      `api/email_subscriptions/${request.params.token}/less`,
      request.body,
    )
  }

  @httpPost('/email_subscriptions/:token/more')
  async subscriptionsMore(request: Request, response: Response): Promise<void> {
    await this.httpService.callPaymentsServer(
      request,
      response,
      `api/email_subscriptions/${request.params.token}/more`,
      request.body,
    )
  }

  @httpPost('/email_subscriptions/:token/mute/:campaignId')
  async subscriptionsMute(request: Request, response: Response): Promise<void> {
    await this.httpService.callPaymentsServer(
      request,
      response,
      `api/email_subscriptions/${request.params.token}/mute/${request.params.campaignId}`,
      request.body,
    )
  }

  @httpPost('/email_subscriptions/:token/unsubscribe')
  async subscriptionsUnsubscribe(request: Request, response: Response): Promise<void> {
    await this.httpService.callPaymentsServer(
      request,
      response,
      `api/email_subscriptions/${request.params.token}/unsubscribe`,
      request.body,
    )
  }

  @httpPost('/payments/stripe-setup-intent', TYPES.ApiGateway_SubscriptionTokenAuthMiddleware)
  async createStripeSetupIntent(request: Request, response: Response): Promise<void> {
    await this.httpService.callPaymentsServer(request, response, 'api/pro_users/stripe-setup-intent', request.body)
  }

  @all('/pro_users(/*)?')
  async proUsers(request: Request, response: Response): Promise<void> {
    await this.httpService.callPaymentsServer(request, response, request.path.replace('v1', 'api'), request.body)
  }

  @all('/refunds')
  async refunds(request: Request, response: Response): Promise<void> {
    await this.httpService.callPaymentsServer(request, response, 'api/refunds', request.body)
  }
}
