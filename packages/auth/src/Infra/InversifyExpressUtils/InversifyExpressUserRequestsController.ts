import { Request, Response } from 'express'
import { BaseHttpController, results, httpPost, controller } from 'inversify-express-utils'

import TYPES from '../../Bootstrap/Types'
import { UserRequestsController } from '../../Controller/UserRequestsController'
import { inject } from 'inversify'

@controller('/users/:userUuid/requests')
export class InversifyExpressUserRequestsController extends BaseHttpController {
  constructor(@inject(TYPES.Auth_UserRequestsController) protected userRequestsController: UserRequestsController) {
    super()
  }

  @httpPost('/', TYPES.Auth_RequiredCrossServiceTokenMiddleware)
  async submitRequest(request: Request, response: Response): Promise<results.JsonResult> {
    const result = await this.userRequestsController.submitUserRequest({
      requestType: request.body.requestType,
      userUuid: response.locals.user.uuid,
      userEmail: response.locals.user.email,
    })

    return this.json(result.data, result.status)
  }
}
