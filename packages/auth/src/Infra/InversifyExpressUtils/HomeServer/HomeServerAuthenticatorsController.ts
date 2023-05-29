import { ControllerContainerInterface } from '@standardnotes/domain-core'
import { Request, Response } from 'express'

import { AuthenticatorsController } from '../../../Controller/AuthenticatorsController'
import { BaseHttpController, results } from 'inversify-express-utils'

export class HomeServerAuthenticatorsController extends BaseHttpController {
  constructor(
    protected authenticatorsController: AuthenticatorsController,
    private controllerContainer?: ControllerContainerInterface,
  ) {
    super()

    if (this.controllerContainer !== undefined) {
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
  }

  async list(_request: Request, response: Response): Promise<results.JsonResult> {
    const result = await this.authenticatorsController.list({
      userUuid: response.locals.user.uuid,
    })

    return this.json(result.data, result.status)
  }

  async delete(request: Request, response: Response): Promise<results.JsonResult> {
    const result = await this.authenticatorsController.delete({
      userUuid: response.locals.user.uuid,
      authenticatorId: request.params.authenticatorId,
    })

    return this.json(result.data, result.status)
  }

  async generateRegistrationOptions(_request: Request, response: Response): Promise<results.JsonResult> {
    const result = await this.authenticatorsController.generateRegistrationOptions({
      username: response.locals.user.email,
      userUuid: response.locals.user.uuid,
    })

    return this.json(result.data, result.status)
  }

  async verifyRegistration(request: Request, response: Response): Promise<results.JsonResult> {
    const result = await this.authenticatorsController.verifyRegistrationResponse({
      userUuid: response.locals.user.uuid,
      attestationResponse: request.body.attestationResponse,
    })

    return this.json(result.data, result.status)
  }

  async generateAuthenticationOptions(request: Request): Promise<results.JsonResult> {
    const result = await this.authenticatorsController.generateAuthenticationOptions({
      username: request.body.username,
    })

    return this.json(result.data, result.status)
  }
}
