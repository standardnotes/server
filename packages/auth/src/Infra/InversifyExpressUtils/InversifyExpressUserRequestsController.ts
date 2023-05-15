import { Request, Response } from 'express'
import { BaseHttpController, results, httpPost, controller } from 'inversify-express-utils'

import TYPES from '../../Bootstrap/Types'
import { UserRequestsController } from '../../Controller/UserRequestsController'
import { ControllerContainerInterface } from '@standardnotes/domain-core'
import { inject } from 'inversify'

@controller('/users/:userUuid/requests')
export class InversifyExpressUserRequestsController extends BaseHttpController {
  constructor(
    @inject(TYPES.Auth_UserRequestsController) private userRequestsController: UserRequestsController,
    @inject(TYPES.Auth_ControllerContainer) private controllerContainer: ControllerContainerInterface,
  ) {
    super()

    this.controllerContainer.register('auth.users.createRequest', this.submitRequest.bind(this))
  }

  @httpPost('/', TYPES.Auth_ApiGatewayAuthMiddleware)
  async submitRequest(request: Request, response: Response): Promise<results.JsonResult> {
    const result = await this.userRequestsController.submitUserRequest({
      requestType: request.body.requestType,
      userUuid: response.locals.user.uuid,
      userEmail: response.locals.user.email,
    })

    return this.json(result.data, result.status)
  }
}
