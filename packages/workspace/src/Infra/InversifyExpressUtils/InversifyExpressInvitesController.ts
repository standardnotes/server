import { Request, Response } from 'express'
import { inject } from 'inversify'
import { BaseHttpController, controller, httpPost, results } from 'inversify-express-utils'
import TYPES from '../../Bootstrap/Types'
import { WorkspacesController } from '../../Controller/WorkspacesController'

@controller('/invites', TYPES.ApiGatewayAuthMiddleware)
export class InversifyExpressInvitesController extends BaseHttpController {
  constructor(@inject(TYPES.WorkspacesController) private workspacesController: WorkspacesController) {
    super()
  }

  @httpPost('/:inviteUuid/accept')
  async acceptInvite(request: Request, response: Response): Promise<results.JsonResult> {
    const result = await this.workspacesController.acceptInvite({
      ...request.body,
      inviteUuid: request.params.inviteUuid,
      userUuid: response.locals.user.uuid,
    })

    return this.json(result.data, result.status)
  }
}
