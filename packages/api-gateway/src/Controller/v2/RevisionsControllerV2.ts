import { Request, Response } from 'express'
import { inject } from 'inversify'
import { BaseHttpController, controller, httpDelete, httpGet } from 'inversify-express-utils'

import { TYPES } from '../../Bootstrap/Types'
import { ServiceProxyInterface } from '../../Service/Http/ServiceProxyInterface'

@controller('/v2/items/:itemUuid/revisions', TYPES.AuthMiddleware)
export class RevisionsControllerV2 extends BaseHttpController {
  constructor(@inject(TYPES.HTTPService) private httpService: ServiceProxyInterface) {
    super()
  }

  @httpGet('/')
  async getRevisions(request: Request, response: Response): Promise<void> {
    await this.httpService.callRevisionsServer(request, response, `items/${request.params.itemUuid}/revisions`)
  }

  @httpGet('/:id')
  async getRevision(request: Request, response: Response): Promise<void> {
    await this.httpService.callRevisionsServer(
      request,
      response,
      `items/${request.params.itemUuid}/revisions/${request.params.id}`,
    )
  }

  @httpDelete('/:id')
  async deleteRevision(request: Request, response: Response): Promise<void> {
    await this.httpService.callRevisionsServer(
      request,
      response,
      `items/${request.params.itemUuid}/revisions/${request.params.id}`,
    )
  }
}
