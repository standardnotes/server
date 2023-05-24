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
import { TYPES } from '../../Bootstrap/Types'
import { ServiceProxyInterface } from '../../Service/Http/ServiceProxyInterface'
import { TokenAuthenticationMethod } from '../TokenAuthenticationMethod'
import { EndpointResolverInterface } from '../../Service/Resolver/EndpointResolverInterface'

@controller('/v1/users')
export class UsersController extends BaseHttpController {
  constructor(
    @inject(TYPES.ServiceProxy) private httpService: ServiceProxyInterface,
    @inject(TYPES.EndpointResolver) private endpointResolver: EndpointResolverInterface,
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

  @httpPatch('/:userId', TYPES.RequiredCrossServiceTokenMiddleware)
  async updateUser(request: Request, response: Response): Promise<void> {
    await this.httpService.callAuthServer(
      request,
      response,
      this.endpointResolver.resolveEndpointOrMethodIdentifier('PATCH', 'users/:userId', request.params.userId),
      request.body,
    )
  }

  @httpPut('/:userUuid/password', TYPES.RequiredCrossServiceTokenMiddleware)
  async changePassword(request: Request, response: Response): Promise<void> {
    this.logger.debug(
      '[DEPRECATED] use endpoint /v1/users/:userUuid/attributes/credentials instead of /v1/users/:userUuid/password',
    )

    await this.httpService.callAuthServer(
      request,
      response,
      this.endpointResolver.resolveEndpointOrMethodIdentifier(
        'PUT',
        'users/:userUuid/attributes/credentials',
        request.params.userUuid,
      ),
      request.body,
    )
  }

  @httpPut('/:userUuid/attributes/credentials', TYPES.RequiredCrossServiceTokenMiddleware)
  async changeCredentials(request: Request, response: Response): Promise<void> {
    await this.httpService.callAuthServer(
      request,
      response,
      this.endpointResolver.resolveEndpointOrMethodIdentifier(
        'PUT',
        'users/:userUuid/attributes/credentials',
        request.params.userUuid,
      ),
      request.body,
    )
  }

  @httpGet('/:userId/params', TYPES.RequiredCrossServiceTokenMiddleware)
  async getKeyParams(request: Request, response: Response): Promise<void> {
    await this.httpService.callAuthServer(
      request,
      response,
      this.endpointResolver.resolveEndpointOrMethodIdentifier('GET', 'auth/params'),
    )
  }

  @all('/:userId/mfa', TYPES.RequiredCrossServiceTokenMiddleware)
  async blockMFA(): Promise<results.StatusCodeResult> {
    return this.statusCode(401)
  }

  @httpPost('/:userUuid/integrations/listed', TYPES.RequiredCrossServiceTokenMiddleware)
  async createListedAccount(request: Request, response: Response): Promise<void> {
    await this.httpService.callAuthServer(
      request,
      response,
      this.endpointResolver.resolveEndpointOrMethodIdentifier('POST', 'listed'),
      request.body,
    )
  }

  @httpPost('/')
  async register(request: Request, response: Response): Promise<void> {
    await this.httpService.callAuthServer(
      request,
      response,
      this.endpointResolver.resolveEndpointOrMethodIdentifier('POST', 'auth'),
      request.body,
    )
  }

  @httpGet('/:userUuid/settings', TYPES.RequiredCrossServiceTokenMiddleware)
  async listSettings(request: Request, response: Response): Promise<void> {
    await this.httpService.callAuthServer(
      request,
      response,
      this.endpointResolver.resolveEndpointOrMethodIdentifier(
        'GET',
        'users/:userUuid/settings',
        request.params.userUuid,
      ),
    )
  }

  @httpPut('/:userUuid/settings', TYPES.RequiredCrossServiceTokenMiddleware)
  async putSetting(request: Request, response: Response): Promise<void> {
    await this.httpService.callAuthServer(
      request,
      response,
      this.endpointResolver.resolveEndpointOrMethodIdentifier(
        'PUT',
        'users/:userUuid/settings',
        request.params.userUuid,
      ),
      request.body,
    )
  }

  @httpGet('/:userUuid/settings/:settingName', TYPES.RequiredCrossServiceTokenMiddleware)
  async getSetting(request: Request, response: Response): Promise<void> {
    await this.httpService.callAuthServer(
      request,
      response,
      this.endpointResolver.resolveEndpointOrMethodIdentifier(
        'GET',
        'users/:userUuid/settings/:settingName',
        request.params.userUuid,
        request.params.settingName,
      ),
    )
  }

  @httpDelete('/:userUuid/settings/:settingName', TYPES.RequiredCrossServiceTokenMiddleware)
  async deleteSetting(request: Request, response: Response): Promise<void> {
    await this.httpService.callAuthServer(
      request,
      response,
      this.endpointResolver.resolveEndpointOrMethodIdentifier(
        'DELETE',
        'users/:userUuid/settings/:settingName',
        request.params.userUuid,
        request.params.settingName,
      ),
      request.body,
    )
  }

  @httpGet('/:userUuid/subscription-settings/:subscriptionSettingName', TYPES.RequiredCrossServiceTokenMiddleware)
  async getSubscriptionSetting(request: Request, response: Response): Promise<void> {
    await this.httpService.callAuthServer(
      request,
      response,
      this.endpointResolver.resolveEndpointOrMethodIdentifier(
        'GET',
        'users/:userUuid/subscription-settings/:subscriptionSettingName',
        request.params.userUuid,
        request.params.subscriptionSettingName,
      ),
    )
  }

  @httpGet('/:userUuid/features', TYPES.RequiredCrossServiceTokenMiddleware)
  async getFeatures(request: Request, response: Response): Promise<void> {
    await this.httpService.callAuthServer(
      request,
      response,
      this.endpointResolver.resolveEndpointOrMethodIdentifier(
        'GET',
        'users/:userUuid/features',
        request.params.userUuid,
      ),
    )
  }

  @httpGet('/:userUuid/subscription', TYPES.RequiredCrossServiceTokenMiddleware)
  async getSubscription(request: Request, response: Response): Promise<void> {
    await this.httpService.callAuthServer(
      request,
      response,
      this.endpointResolver.resolveEndpointOrMethodIdentifier(
        'GET',
        'users/:userUuid/subscription',
        request.params.userUuid,
      ),
    )
  }

  @httpGet('/subscription', TYPES.SubscriptionTokenAuthMiddleware)
  async getSubscriptionBySubscriptionToken(request: Request, response: Response): Promise<void> {
    if (response.locals.tokenAuthenticationMethod === TokenAuthenticationMethod.OfflineSubscriptionToken) {
      await this.httpService.callAuthServer(
        request,
        response,
        this.endpointResolver.resolveEndpointOrMethodIdentifier('GET', 'offline/users/subscription'),
      )

      return
    }

    await this.httpService.callAuthServer(
      request,
      response,
      this.endpointResolver.resolveEndpointOrMethodIdentifier(
        'GET',
        'users/:userUuid/subscription',
        response.locals.user.uuid,
      ),
    )
  }

  @httpDelete('/:userUuid', TYPES.RequiredCrossServiceTokenMiddleware)
  async deleteUser(request: Request, response: Response): Promise<void> {
    await this.httpService.callPaymentsServer(request, response, 'api/account', request.body)
  }

  @httpPost('/:userUuid/requests', TYPES.RequiredCrossServiceTokenMiddleware)
  async submitRequest(request: Request, response: Response): Promise<void> {
    await this.httpService.callAuthServer(
      request,
      response,
      this.endpointResolver.resolveEndpointOrMethodIdentifier(
        'POST',
        'users/:userUuid/requests',
        request.params.userUuid,
      ),
      request.body,
    )
  }
}
