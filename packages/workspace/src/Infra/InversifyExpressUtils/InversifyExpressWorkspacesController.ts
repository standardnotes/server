import { Request, Response } from 'express'
import { inject } from 'inversify'
import { BaseHttpController, controller, httpPost, results } from 'inversify-express-utils'
import TYPES from '../../Bootstrap/Types'
import { WorkspacesController } from '../../Controller/WorkspacesController'

@controller('/workspaces', TYPES.ApiGatewayAuthMiddleware)
export class InversifyExpressWorkspacesController extends BaseHttpController {
  constructor(@inject(TYPES.WorkspacesController) private workspacesController: WorkspacesController) {
    super()
  }

  @httpPost('/')
  async create(request: Request, response: Response): Promise<results.JsonResult> {
    const result = await this.workspacesController.createWorkspace({
      ...request.body,
      ownerUuid: response.locals.user.uuid,
    })

    return this.json(result.data, result.status)
  }

  @httpPost('/:workspaceUuid/invites')
  async inviteToWorkspace(request: Request, response: Response): Promise<results.JsonResult> {
    if (request.params.workspaceUuid !== request.body.workspaceUuid) {
      return this.json(
        {
          error: {
            message: 'Invalid workspace uuid.',
          },
        },
        400,
      )
    }

    const result = await this.workspacesController.inviteToWorkspace({
      ...request.body,
      inviterUuid: response.locals.user.uuid,
    })

    return this.json(result.data, result.status)
  }
}
