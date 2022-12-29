import { Request, Response } from 'express'
import { inject } from 'inversify'
import {
  BaseHttpController,
  controller,
  httpDelete,
  httpGet,
  httpPost,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  results,
} from 'inversify-express-utils'
import TYPES from '../../Bootstrap/Types'
import { AuthenticatorsController } from '../../Controller/AuthenticatorsController'

@controller('/authenticators', TYPES.ApiGatewayAuthMiddleware)
export class InversifyExpressAuthenticatorsController extends BaseHttpController {
  constructor(@inject(TYPES.AuthenticatorsController) private authenticatorsController: AuthenticatorsController) {
    super()
  }

  @httpGet('/')
  async list(_request: Request, response: Response): Promise<results.JsonResult> {
    const result = await this.authenticatorsController.list({
      userUuid: response.locals.user.uuid,
    })

    return this.json(result.data, result.status)
  }

  @httpDelete('/:authenticatorId')
  async delete(request: Request, response: Response): Promise<results.JsonResult> {
    const result = await this.authenticatorsController.delete({
      userUuid: response.locals.user.uuid,
      authenticatorId: request.params.authenticatorId,
    })

    return this.json(result.data, result.status)
  }

  @httpGet('/generate-registration-options')
  async generateRegistrationOptions(_request: Request, response: Response): Promise<results.JsonResult> {
    const result = await this.authenticatorsController.generateRegistrationOptions({
      username: response.locals.user.email,
      userUuid: response.locals.user.uuid,
    })

    return this.json(result.data, result.status)
  }

  @httpPost('/verify-registration')
  async verifyRegistration(request: Request, response: Response): Promise<results.JsonResult> {
    const result = await this.authenticatorsController.verifyRegistrationResponse({
      userUuid: response.locals.user.uuid,
      registrationCredential: request.body.registrationCredential,
      name: request.body.name,
    })

    return this.json(result.data, result.status)
  }

  @httpGet('/generate-authentication-options')
  async generateAuthenticationOptions(_request: Request, response: Response): Promise<results.JsonResult> {
    const result = await this.authenticatorsController.generateAuthenticationOptions({
      userUuid: response.locals.user.uuid,
    })

    return this.json(result.data, result.status)
  }

  @httpPost('/verify-authentication')
  async verifyAuthentication(request: Request, response: Response): Promise<results.JsonResult> {
    const result = await this.authenticatorsController.verifyAuthenticationResponse({
      userUuid: response.locals.user.uuid,
      authenticationCredential: request.body,
    })

    return this.json(result.data, result.status)
  }
}
