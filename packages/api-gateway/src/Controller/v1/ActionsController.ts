import { Request, Response } from 'express'
import { inject } from 'inversify'
import { BaseHttpController, controller, httpGet, httpPost } from 'inversify-express-utils'
import { TYPES } from '../../Bootstrap/Types'
import { ServiceProxyInterface } from '../../Service/Http/ServiceProxyInterface'
import { EndpointResolverInterface } from '../../Service/Resolver/EndpointResolverInterface'

@controller('/v1')
export class ActionsController extends BaseHttpController {
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
      this.endpointResolver.resolveEndpointOrMethodIdentifier('POST', 'auth/sign_in'),
      request.body,
    )
  }

  @httpGet('/login-params', TYPES.OptionalCrossServiceTokenMiddleware)
  async loginParams(request: Request, response: Response): Promise<void> {
    await this.serviceProxy.callAuthServer(
      request,
      response,
      this.endpointResolver.resolveEndpointOrMethodIdentifier('GET', 'auth/params'),
      request.body,
    )
  }

  @httpPost('/logout', TYPES.OptionalCrossServiceTokenMiddleware)
  async logout(request: Request, response: Response): Promise<void> {
    await this.serviceProxy.callAuthServer(
      request,
      response,
      this.endpointResolver.resolveEndpointOrMethodIdentifier('POST', 'auth/sign_out'),
      request.body,
    )
  }

  @httpGet('/unsubscribe/:token')
  async emailUnsubscribe(request: Request, response: Response): Promise<void> {
    await this.serviceProxy.callEmailServer(
      request,
      response,
      `subscriptions/actions/unsubscribe/${request.params.token}`,
      request.body,
    )
  }

  @httpPost('/recovery/codes', TYPES.RequiredCrossServiceTokenMiddleware)
  async recoveryCodes(request: Request, response: Response): Promise<void> {
    await this.serviceProxy.callAuthServer(
      request,
      response,
      this.endpointResolver.resolveEndpointOrMethodIdentifier('POST', 'auth/recovery/codes'),
      request.body,
    )
  }

  @httpPost('/recovery/login')
  async recoveryLogin(request: Request, response: Response): Promise<void> {
    await this.serviceProxy.callAuthServer(
      request,
      response,
      this.endpointResolver.resolveEndpointOrMethodIdentifier('POST', 'auth/recovery/login'),
      request.body,
    )
  }

  @httpPost('/recovery/login-params')
  async recoveryParams(request: Request, response: Response): Promise<void> {
    await this.serviceProxy.callAuthServer(
      request,
      response,
      this.endpointResolver.resolveEndpointOrMethodIdentifier('POST', 'auth/recovery/params'),
      request.body,
    )
  }
}
