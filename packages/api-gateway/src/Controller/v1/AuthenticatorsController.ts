import { inject } from 'inversify'
import { Request, Response } from 'express'
import { controller, BaseHttpController, httpPost, httpGet, httpDelete } from 'inversify-express-utils'

import { TYPES } from '../../Bootstrap/Types'
import { ServiceProxyInterface } from '../../Service/Http/ServiceProxyInterface'
import { EndpointResolverInterface } from '../../Service/Resolver/EndpointResolverInterface'

@controller('/v1/authenticators')
export class AuthenticatorsController extends BaseHttpController {
  constructor(
    @inject(TYPES.ApiGateway_ServiceProxy) private httpService: ServiceProxyInterface,
    @inject(TYPES.ApiGateway_EndpointResolver) private endpointResolver: EndpointResolverInterface,
  ) {
    super()
  }

  @httpDelete('/:authenticatorId', TYPES.ApiGateway_RequiredCrossServiceTokenMiddleware)
  async delete(request: Request, response: Response): Promise<void> {
    await this.httpService.callAuthServer(
      request,
      response,
      this.endpointResolver.resolveEndpointOrMethodIdentifier(
        'DELETE',
        'authenticators/:authenticatorId',
        request.params.authenticatorId,
      ),
      request.body,
    )
  }

  @httpGet('/', TYPES.ApiGateway_RequiredCrossServiceTokenMiddleware)
  async list(request: Request, response: Response): Promise<void> {
    await this.httpService.callAuthServer(
      request,
      response,
      this.endpointResolver.resolveEndpointOrMethodIdentifier('GET', 'authenticators/'),
      request.body,
    )
  }

  @httpGet('/generate-registration-options', TYPES.ApiGateway_RequiredCrossServiceTokenMiddleware)
  async generateRegistrationOptions(request: Request, response: Response): Promise<void> {
    await this.httpService.callAuthServer(
      request,
      response,
      this.endpointResolver.resolveEndpointOrMethodIdentifier('GET', 'authenticators/generate-registration-options'),
      request.body,
    )
  }

  @httpPost('/generate-authentication-options')
  async generateAuthenticationOptions(request: Request, response: Response): Promise<void> {
    await this.httpService.callAuthServer(
      request,
      response,
      this.endpointResolver.resolveEndpointOrMethodIdentifier('POST', 'authenticators/generate-authentication-options'),
      request.body,
    )
  }

  @httpPost('/verify-registration', TYPES.ApiGateway_RequiredCrossServiceTokenMiddleware)
  async verifyRegistration(request: Request, response: Response): Promise<void> {
    await this.httpService.callAuthServer(
      request,
      response,
      this.endpointResolver.resolveEndpointOrMethodIdentifier('POST', 'authenticators/verify-registration'),
      request.body,
    )
  }
}
