import { Request, Response } from 'express'
import { results, httpPost, controller } from 'inversify-express-utils'

import TYPES from '../../Bootstrap/Types'
import { UserRequestsController } from '../../Controller/UserRequestsController'
import { inject } from 'inversify'
import { BaseUserRequestsController } from './Base/BaseUserRequestsController'

@controller('/users/:userUuid/requests')
export class AnnotatedUserRequestsController extends BaseUserRequestsController {
  constructor(@inject(TYPES.Auth_UserRequestsController) override userRequestsController: UserRequestsController) {
    super(userRequestsController)
  }

  @httpPost('/', TYPES.Auth_RequiredCrossServiceTokenMiddleware)
  override async submitRequest(request: Request, response: Response): Promise<results.JsonResult> {
    return super.submitRequest(request, response)
  }
}
