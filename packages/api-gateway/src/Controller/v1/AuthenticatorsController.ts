import { inject } from 'inversify'
import { Request, Response } from 'express'
import { controller, BaseHttpController, httpPost, httpGet, httpDelete } from 'inversify-express-utils'

import TYPES from '../../Bootstrap/Types'
import { HttpServiceInterface } from '../../Service/Http/HttpServiceInterface'

@controller('/v1/authenticators')
export class AuthenticatorsController extends BaseHttpController {
  constructor(@inject(TYPES.HTTPService) private httpService: HttpServiceInterface) {
    super()
  }

  @httpDelete('/:authenticatorId', TYPES.AuthMiddleware)
  async delete(request: Request, response: Response): Promise<void> {
    await this.httpService.callAuthServer(
      request,
      response,
      `authenticators/${request.params.authenticatorId}`,
      request.body,
    )
  }

  @httpGet('/', TYPES.AuthMiddleware)
  async list(request: Request, response: Response): Promise<void> {
    await this.httpService.callAuthServer(request, response, 'authenticators/', request.body)
  }

  @httpGet('/generate-registration-options', TYPES.AuthMiddleware)
  async generateRegistrationOptions(request: Request, response: Response): Promise<void> {
    await this.httpService.callAuthServer(
      request,
      response,
      'authenticators/generate-registration-options',
      request.body,
    )
  }

  @httpPost('/generate-authentication-options')
  async generateAuthenticationOptions(request: Request, response: Response): Promise<void> {
    await this.httpService.callAuthServer(
      request,
      response,
      'authenticators/generate-authentication-options',
      request.body,
    )
  }

  @httpPost('/verify-registration', TYPES.AuthMiddleware)
  async verifyRegistration(request: Request, response: Response): Promise<void> {
    await this.httpService.callAuthServer(request, response, 'authenticators/verify-registration', request.body)
  }
}
