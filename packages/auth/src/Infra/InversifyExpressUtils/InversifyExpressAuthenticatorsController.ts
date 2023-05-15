import { Request, Response } from 'express'
import {
  BaseHttpController,
  httpDelete,
  httpGet,
  httpPost,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  results,
} from 'inversify-express-utils'
import TYPES from '../../Bootstrap/Types'
import { AuthenticatorsController } from '../../Controller/AuthenticatorsController'
import { ControllerContainerInterface } from '@standardnotes/domain-core'

export class InversifyExpressAuthenticatorsController extends BaseHttpController {
  constructor(
    private authenticatorsController: AuthenticatorsController,
    private controllerContainer: ControllerContainerInterface,
  ) {
    super()

    this.controllerContainer.register('auth.authenticators.list', this.list.bind(this))
    this.controllerContainer.register('auth.authenticators.delete', this.delete.bind(this))
    this.controllerContainer.register(
      'auth.authenticators.generateRegistrationOptions',
      this.generateRegistrationOptions.bind(this),
    )
    this.controllerContainer.register(
      'auth.authenticators.verifyRegistrationResponse',
      this.verifyRegistration.bind(this),
    )
    this.controllerContainer.register(
      'auth.authenticators.generateAuthenticationOptions',
      this.generateAuthenticationOptions.bind(this),
    )
  }

  @httpGet('/authenticators/', TYPES.Auth_ApiGatewayAuthMiddleware)
  async list(_request: Request, response: Response): Promise<results.JsonResult> {
    const result = await this.authenticatorsController.list({
      userUuid: response.locals.user.uuid,
    })

    return this.json(result.data, result.status)
  }

  @httpDelete('/authenticators/:authenticatorId', TYPES.Auth_ApiGatewayAuthMiddleware)
  async delete(request: Request, response: Response): Promise<results.JsonResult> {
    const result = await this.authenticatorsController.delete({
      userUuid: response.locals.user.uuid,
      authenticatorId: request.params.authenticatorId,
    })

    return this.json(result.data, result.status)
  }

  @httpGet('/authenticators/generate-registration-options', TYPES.Auth_ApiGatewayAuthMiddleware)
  async generateRegistrationOptions(_request: Request, response: Response): Promise<results.JsonResult> {
    const result = await this.authenticatorsController.generateRegistrationOptions({
      username: response.locals.user.email,
      userUuid: response.locals.user.uuid,
    })

    return this.json(result.data, result.status)
  }

  @httpPost('/authenticators/verify-registration', TYPES.Auth_ApiGatewayAuthMiddleware)
  async verifyRegistration(request: Request, response: Response): Promise<results.JsonResult> {
    const result = await this.authenticatorsController.verifyRegistrationResponse({
      userUuid: response.locals.user.uuid,
      attestationResponse: request.body.attestationResponse,
    })

    return this.json(result.data, result.status)
  }

  @httpPost('/authenticators/generate-authentication-options')
  async generateAuthenticationOptions(request: Request): Promise<results.JsonResult> {
    const result = await this.authenticatorsController.generateAuthenticationOptions({
      username: request.body.username,
    })

    return this.json(result.data, result.status)
  }
}
