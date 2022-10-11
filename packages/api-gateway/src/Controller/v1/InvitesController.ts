import { inject } from 'inversify'
import { Request, Response } from 'express'
import { controller, BaseHttpController, httpPost } from 'inversify-express-utils'

import TYPES from '../../Bootstrap/Types'
import { HttpServiceInterface } from '../../Service/Http/HttpServiceInterface'

@controller('/v1/invites', TYPES.AuthMiddleware)
export class InvitesController extends BaseHttpController {
  constructor(@inject(TYPES.HTTPService) private httpService: HttpServiceInterface) {
    super()
  }

  @httpPost('/:inviteUuid/accept')
  async accept(request: Request, response: Response): Promise<void> {
    await this.httpService.callWorkspaceServer(
      request,
      response,
      `invites/${request.params.inviteUuid}/accept`,
      request.body,
    )
  }
}
