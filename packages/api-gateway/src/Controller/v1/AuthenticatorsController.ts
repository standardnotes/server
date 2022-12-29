import { inject } from 'inversify'
import { Request, Response } from 'express'
import { controller, BaseHttpController, httpPost, httpGet } from 'inversify-express-utils'

import TYPES from '../../Bootstrap/Types'
import { HttpServiceInterface } from '../../Service/Http/HttpServiceInterface'

@controller('/v1/authenticators', TYPES.AuthMiddleware)
export class AuthenticatorsController extends BaseHttpController {
  constructor(@inject(TYPES.HTTPService) private httpService: HttpServiceInterface) {
    super()
  }

  @httpGet('/')
  async list(request: Request, response: Response): Promise<void> {
    await this.httpService.callAuthServer(request, response, 'authenticators/', request.body)
  }

  @httpGet('/generate-registration-options')
  async generateRegistrationOptions(request: Request, response: Response): Promise<void> {
    await this.httpService.callAuthServer(
      request,
      response,
      'authenticators/generate-registration-options',
      request.body,
    )
  }

  @httpGet('/generate-authentication-options')
  async generateAuthenticationOptions(request: Request, response: Response): Promise<void> {
    await this.httpService.callAuthServer(
      request,
      response,
      'authenticators/generate-authentication-options',
      request.body,
    )
  }

  @httpPost('/verify-registration')
  async verifyRegistration(request: Request, response: Response): Promise<void> {
    await this.httpService.callAuthServer(request, response, 'authenticators/verify-registration', request.body)
  }

  @httpPost('/verify-authentication')
  async verifyAuthentication(request: Request, response: Response): Promise<void> {
    await this.httpService.callAuthServer(request, response, 'authenticators/verify-authentication', request.body)
  }
}
