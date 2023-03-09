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

@controller('/authenticators')
export class InversifyExpressAuthenticatorsController extends BaseHttpController {
  constructor(@inject(TYPES.AuthenticatorsController) private authenticatorsController: AuthenticatorsController) {
    super()
  }

  @httpGet('/', TYPES.ApiGatewayAuthMiddleware)
  async list(_request: Request, response: Response): Promise<results.JsonResult> {
    const result = await this.authenticatorsController.list({
      userUuid: response.locals.user.uuid,
    })

    return this.json(result.data, result.status)
  }

  @httpDelete('/:authenticatorId', TYPES.ApiGatewayAuthMiddleware)
  async delete(request: Request, response: Response): Promise<results.JsonResult> {
    const result = await this.authenticatorsController.delete({
      userUuid: response.locals.user.uuid,
      authenticatorId: request.params.authenticatorId,
    })

    return this.json(result.data, result.status)
  }

  @httpGet('/generate-registration-options', TYPES.ApiGatewayAuthMiddleware)
  async generateRegistrationOptions(_request: Request, response: Response): Promise<results.JsonResult> {
    const result = await this.authenticatorsController.generateRegistrationOptions({
      username: response.locals.user.email,
      userUuid: response.locals.user.uuid,
    })

    return this.json(result.data, result.status)
  }

  @httpPost('/verify-registration', TYPES.ApiGatewayAuthMiddleware)
  async verifyRegistration(request: Request, response: Response): Promise<results.JsonResult> {
    const result = await this.authenticatorsController.verifyRegistrationResponse({
      userUuid: response.locals.user.uuid,
      attestationResponse: request.body.attestationResponse,
    })

    return this.json(result.data, result.status)
  }

  @httpPost('/generate-authentication-options')
  async generateAuthenticationOptions(request: Request): Promise<results.JsonResult> {
    const result = await this.authenticatorsController.generateAuthenticationOptions({
      username: request.body.username,
    })

    return this.json(result.data, result.status)
  }
}
