import { inject } from 'inversify'
import { Request, Response } from 'express'
import { controller, BaseHttpController, httpPost } from 'inversify-express-utils'

import TYPES from '../../Bootstrap/Types'
import { HttpServiceInterface } from '../../Service/Http/HttpServiceInterface'

@controller('/v1/workspaces')
export class WorkspacesController extends BaseHttpController {
  constructor(@inject(TYPES.HTTPService) private httpService: HttpServiceInterface) {
    super()
  }

  @httpPost('/', TYPES.AuthMiddleware)
  async create(request: Request, response: Response): Promise<void> {
    await this.httpService.callWorkspaceServer(request, response, 'workspaces', request.body)
  }
}
