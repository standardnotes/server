import { Request, Response } from 'express'
import { inject } from 'inversify'
import {
  all,
  BaseHttpController,
  controller,
  httpDelete,
  httpGet,
  httpPatch,
  httpPost,
  httpPut,
  results,
} from 'inversify-express-utils'
import { Logger } from 'winston'
import TYPES from '../../Bootstrap/Types'
import { HttpServiceInterface } from '../../Service/Http/HttpServiceInterface'
import { TokenAuthenticationMethod } from '../TokenAuthenticationMethod'

@controller('/v1/users', TYPES.StatisticsMiddleware)
export class UsersController extends BaseHttpController {
  constructor(
    @inject(TYPES.HTTPService) private httpService: HttpServiceInterface,
    @inject(TYPES.Logger) private logger: Logger,
  ) {
    super()
  }

  @httpPost('/claim-account')
  async claimAccount(request: Request, response: Response): Promise<void> {
    await this.httpService.callPaymentsServer(request, response, 'api/pro_users/claim-account', request.body)
  }

  @httpPost('/send-activation-code', TYPES.SubscriptionTokenAuthMiddleware)
  async sendActivationCode(request: Request, response: Response): Promise<void> {
    await this.httpService.callPaymentsServer(request, response, 'api/pro_users/send-activation-code', request.body)
  }

  @httpPatch('/:userId', TYPES.AuthMiddleware)
  async updateUser(request: Request, response: Response): Promise<void> {
    await this.httpService.callAuthServer(request, response, `users/${request.params.userId}`, request.body)
  }

  @httpPut('/:userUuid/password', TYPES.AuthMiddleware)
  async changePassword(request: Request, response: Response): Promise<void> {
    this.logger.debug(
      '[DEPRECATED] use endpoint /v1/users/:userUuid/attributes/credentials instead of /v1/users/:userUuid/password',
    )

    await this.httpService.callAuthServer(
      request,
      response,
      `users/${request.params.userUuid}/attributes/credentials`,
      request.body,
    )
  }

  @httpPut('/:userUuid/attributes/credentials', TYPES.AuthMiddleware)
  async changeCredentials(request: Request, response: Response): Promise<void> {
    await this.httpService.callAuthServer(
      request,
      response,
      `users/${request.params.userUuid}/attributes/credentials`,
      request.body,
    )
  }

  @httpGet('/:userId/params', TYPES.AuthMiddleware)
  async getKeyParams(request: Request, response: Response): Promise<void> {
    await this.httpService.callAuthServer(request, response, 'auth/params')
  }

  @all('/:userId/mfa', TYPES.AuthMiddleware)
  async blockMFA(): Promise<results.StatusCodeResult> {
    return this.statusCode(401)
  }

  @httpPost('/:userUuid/integrations/listed', TYPES.AuthMiddleware)
  async createListedAccount(request: Request, response: Response): Promise<void> {
    await this.httpService.callAuthServer(request, response, 'listed', request.body)
  }

  @httpPost('/')
  async register(request: Request, response: Response): Promise<void> {
    await this.httpService.callAuthServer(request, response, 'auth', request.body)
  }

  @httpGet('/:userUuid/settings', TYPES.AuthMiddleware)
  async listSettings(request: Request, response: Response): Promise<void> {
    await this.httpService.callAuthServer(request, response, `users/${request.params.userUuid}/settings`)
  }

  @httpPut('/:userUuid/settings', TYPES.AuthMiddleware)
  async putSetting(request: Request, response: Response): Promise<void> {
    await this.httpService.callAuthServer(request, response, `users/${request.params.userUuid}/settings`, request.body)
  }

  @httpGet('/:userUuid/settings/:settingName', TYPES.AuthMiddleware)
  async getSetting(request: Request, response: Response): Promise<void> {
    await this.httpService.callAuthServer(
      request,
      response,
      `users/${request.params.userUuid}/settings/${request.params.settingName}`,
    )
  }

  @httpDelete('/:userUuid/settings/:settingName', TYPES.AuthMiddleware)
  async deleteSetting(request: Request, response: Response): Promise<void> {
    await this.httpService.callAuthServer(
      request,
      response,
      `users/${request.params.userUuid}/settings/${request.params.settingName}`,
      request.body,
    )
  }

  @httpGet('/:userUuid/subscription-settings/:subscriptionSettingName', TYPES.AuthMiddleware)
  async getSubscriptionSetting(request: Request, response: Response): Promise<void> {
    await this.httpService.callAuthServer(
      request,
      response,
      `users/${request.params.userUuid}/subscription-settings/${request.params.subscriptionSettingName}`,
    )
  }

  @httpGet('/:userUuid/features', TYPES.AuthMiddleware)
  async getFeatures(request: Request, response: Response): Promise<void> {
    await this.httpService.callAuthServer(request, response, `users/${request.params.userUuid}/features`)
  }

  @httpGet('/:userUuid/subscription', TYPES.AuthMiddleware)
  async getSubscription(request: Request, response: Response): Promise<void> {
    await this.httpService.callAuthServer(request, response, `users/${request.params.userUuid}/subscription`)
  }

  @httpGet('/subscription', TYPES.SubscriptionTokenAuthMiddleware)
  async getSubscriptionBySubscriptionToken(request: Request, response: Response): Promise<void> {
    if (response.locals.tokenAuthenticationMethod === TokenAuthenticationMethod.OfflineSubscriptionToken) {
      await this.httpService.callAuthServer(request, response, 'offline/users/subscription')

      return
    }

    await this.httpService.callAuthServer(request, response, `users/${response.locals.userUuid}/subscription`)
  }

  @httpDelete('/:userUuid', TYPES.AuthMiddleware)
  async deleteUser(request: Request, response: Response): Promise<void> {
    await this.httpService.callPaymentsServer(request, response, 'api/account', request.body)
  }

  @httpPost('/:userUuid/requests', TYPES.AuthMiddleware)
  async submitRequest(request: Request, response: Response): Promise<void> {
    await this.httpService.callAuthServer(request, response, `users/${request.params.userUuid}/requests`, request.body)
  }
}
