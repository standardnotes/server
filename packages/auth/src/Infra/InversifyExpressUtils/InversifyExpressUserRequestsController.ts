import { Request, Response } from 'express'
import { BaseHttpController, results, httpPost } from 'inversify-express-utils'

import TYPES from '../../Bootstrap/Types'
import { UserRequestsController } from '../../Controller/UserRequestsController'
import { ControllerContainerInterface } from '@standardnotes/domain-core'

export class InversifyExpressUserRequestsController extends BaseHttpController {
  constructor(
    private userRequestsController: UserRequestsController,
    private controllerContainer: ControllerContainerInterface,
  ) {
    super()
    this.controllerContainer.register('auth.userRequests.submitRequest', this.submitRequest.bind(this))
  }

  @httpPost('/users/:userUuid/requests/', TYPES.Auth_ApiGatewayAuthMiddleware)
  async submitRequest(request: Request, response: Response): Promise<results.JsonResult> {
    const result = await this.userRequestsController.submitUserRequest({
      requestType: request.body.requestType,
      userUuid: response.locals.user.uuid,
      userEmail: response.locals.user.email,
    })

    return this.json(result.data, result.status)
  }
}
