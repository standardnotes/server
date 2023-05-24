import { Request, Response } from 'express'
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
import { ControllerContainerInterface } from '@standardnotes/domain-core'
import { inject } from 'inversify'

@controller('/authenticators')
export class InversifyExpressAuthenticatorsController extends BaseHttpController {
  constructor(
    @inject(TYPES.Auth_AuthenticatorsController) private authenticatorsController: AuthenticatorsController,
    @inject(TYPES.Auth_ControllerContainer) private controllerContainer: ControllerContainerInterface,
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

  @httpGet('/', TYPES.Auth_RequiredCrossServiceTokenMiddleware)
  async list(_request: Request, response: Response): Promise<results.JsonResult> {
    const result = await this.authenticatorsController.list({
      userUuid: response.locals.user.uuid,
    })

    return this.json(result.data, result.status)
  }

  @httpDelete('/:authenticatorId', TYPES.Auth_RequiredCrossServiceTokenMiddleware)
  async delete(request: Request, response: Response): Promise<results.JsonResult> {
    const result = await this.authenticatorsController.delete({
      userUuid: response.locals.user.uuid,
      authenticatorId: request.params.authenticatorId,
    })

    return this.json(result.data, result.status)
  }

  @httpGet('/generate-registration-options', TYPES.Auth_RequiredCrossServiceTokenMiddleware)
  async generateRegistrationOptions(_request: Request, response: Response): Promise<results.JsonResult> {
    const result = await this.authenticatorsController.generateRegistrationOptions({
      username: response.locals.user.email,
      userUuid: response.locals.user.uuid,
    })

    return this.json(result.data, result.status)
  }

  @httpPost('/verify-registration', TYPES.Auth_RequiredCrossServiceTokenMiddleware)
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
