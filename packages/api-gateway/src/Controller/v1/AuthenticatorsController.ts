import { inject } from 'inversify'
import { Request, Response } from 'express'
import { controller, BaseHttpController, httpPost, httpGet, httpDelete } from 'inversify-express-utils'

import { TYPES } from '../../Bootstrap/Types'
import { ServiceProxyInterface } from '../../Service/Http/ServiceProxyInterface'
import { EndpointResolverInterface } from '../../Service/Resolver/EndpointResolverInterface'

@controller('/v1/authenticators')
export class AuthenticatorsController extends BaseHttpController {
  constructor(
    @inject(TYPES.ServiceProxy) private httpService: ServiceProxyInterface,
    @inject(TYPES.EndpointResolver) private endpointResolver: EndpointResolverInterface,
  ) {
    super()
  }

  @httpDelete('/:authenticatorId', TYPES.RequiredCrossServiceTokenMiddleware)
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

  @httpGet('/', TYPES.RequiredCrossServiceTokenMiddleware)
  async list(request: Request, response: Response): Promise<void> {
    await this.httpService.callAuthServer(
      request,
      response,
      this.endpointResolver.resolveEndpointOrMethodIdentifier('GET', 'authenticators/'),
      request.body,
    )
  }

  @httpGet('/generate-registration-options', TYPES.RequiredCrossServiceTokenMiddleware)
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

  @httpPost('/verify-registration', TYPES.RequiredCrossServiceTokenMiddleware)
  async verifyRegistration(request: Request, response: Response): Promise<void> {
    await this.httpService.callAuthServer(
      request,
      response,
      this.endpointResolver.resolveEndpointOrMethodIdentifier('POST', 'authenticators/verify-registration'),
      request.body,
    )
  }
}
