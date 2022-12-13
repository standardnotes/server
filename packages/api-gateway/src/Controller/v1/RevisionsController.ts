import { Request, Response } from 'express'
import { inject } from 'inversify'
import { BaseHttpController, controller, httpDelete, httpGet } from 'inversify-express-utils'
import TYPES from '../../Bootstrap/Types'
import { HttpServiceInterface } from '../../Service/Http/HttpServiceInterface'

@controller('/v1/items/:item_id/revisions', TYPES.AuthMiddleware)
export class RevisionsController extends BaseHttpController {
  constructor(@inject(TYPES.HTTPService) private httpService: HttpServiceInterface) {
    super()
  }

  @httpGet('/')
  async getRevisions(request: Request, response: Response): Promise<void> {
    await this.httpService.callRevisionsServer(request, response, `items/${request.params.item_id}/revisions`)
  }

  @httpGet('/:id')
  async getRevision(request: Request, response: Response): Promise<void> {
    await this.httpService.callSyncingServer(
      request,
      response,
      `items/${request.params.item_id}/revisions/${request.params.id}`,
    )
  }

  @httpDelete('/:id')
  async deleteRevision(request: Request, response: Response): Promise<void> {
    await this.httpService.callSyncingServer(
      request,
      response,
      `items/${request.params.item_id}/revisions/${request.params.id}`,
    )
  }
}
