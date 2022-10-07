import { Request, Response } from 'express'
import { inject } from 'inversify'
import { BaseHttpController, controller, httpPost, results } from 'inversify-express-utils'
import TYPES from '../../Bootstrap/Types'
import { WorkspacesController } from '../../Controller/WorkspacesController'

@controller('/workspaces')
export class InversifyExpressWorkspacesController extends BaseHttpController {
  constructor(@inject(TYPES.WorkspacesController) private workspacesController: WorkspacesController) {
    super()
  }

  @httpPost('/', TYPES.ApiGatewayAuthMiddleware)
  async create(request: Request, response: Response): Promise<results.JsonResult> {
    const result = await this.workspacesController.createWorkspace({
      ...request.body,
      ownerUuid: response.locals.user.uuid,
    })

    return this.json(result.data, result.status)
  }
}
