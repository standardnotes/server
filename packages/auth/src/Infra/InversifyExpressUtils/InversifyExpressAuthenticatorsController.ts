import { Request, Response } from 'express'
import {
  controller,
  httpDelete,
  httpGet,
  httpPost,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  results,
} from 'inversify-express-utils'
import TYPES from '../../Bootstrap/Types'
import { AuthenticatorsController } from '../../Controller/AuthenticatorsController'
import { inject } from 'inversify'
import { BaseAuthenticatorsController } from './Base/BaseAuthenticatorsController'

@controller('/authenticators')
export class InversifyExpressAuthenticatorsController extends BaseAuthenticatorsController {
  constructor(
    @inject(TYPES.Auth_AuthenticatorsController) override authenticatorsController: AuthenticatorsController,
  ) {
    super(authenticatorsController)
  }

  @httpGet('/', TYPES.Auth_RequiredCrossServiceTokenMiddleware)
  override async list(_request: Request, response: Response): Promise<results.JsonResult> {
    return super.list(_request, response)
  }

  @httpDelete('/:authenticatorId', TYPES.Auth_RequiredCrossServiceTokenMiddleware)
  override async delete(request: Request, response: Response): Promise<results.JsonResult> {
    return super.delete(request, response)
  }

  @httpGet('/generate-registration-options', TYPES.Auth_RequiredCrossServiceTokenMiddleware)
  override async generateRegistrationOptions(_request: Request, response: Response): Promise<results.JsonResult> {
    return super.generateRegistrationOptions(_request, response)
  }

  @httpPost('/verify-registration', TYPES.Auth_RequiredCrossServiceTokenMiddleware)
  override async verifyRegistration(request: Request, response: Response): Promise<results.JsonResult> {
    return super.verifyRegistration(request, response)
  }

  @httpPost('/generate-authentication-options')
  override async generateAuthenticationOptions(request: Request): Promise<results.JsonResult> {
    return super.generateAuthenticationOptions(request)
  }
}
