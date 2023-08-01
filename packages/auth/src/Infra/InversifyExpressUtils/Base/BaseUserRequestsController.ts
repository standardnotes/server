import { ControllerContainerInterface } from '@standardnotes/domain-core'
import { BaseHttpController, results } from 'inversify-express-utils'
import { Request, Response } from 'express'

import { UserRequestsController } from '../../../Controller/UserRequestsController'

export class BaseUserRequestsController extends BaseHttpController {
  constructor(
    protected userRequestsController: UserRequestsController,
    private controllerContainer?: ControllerContainerInterface,
  ) {
    super()

    if (this.controllerContainer !== undefined) {
      this.controllerContainer.register('auth.users.createRequest', this.submitRequest.bind(this))
    }
  }

  async submitRequest(request: Request, response: Response): Promise<results.JsonResult> {
    const result = await this.userRequestsController.submitUserRequest({
      requestType: request.body.requestType,
      userUuid: response.locals.user.uuid,
      userEmail: response.locals.user.email,
    })

    return this.json(result.data, result.status)
  }
}
