import { Request, Response } from 'express'
import { inject } from 'inversify'
import { BaseHttpController, controller, httpGet } from 'inversify-express-utils'
import TYPES from '../../Bootstrap/Types'
import { HttpServiceInterface } from '../../Service/Http/HttpServiceInterface'

@controller('/v2/items/:item_id/revisions', TYPES.AuthMiddleware)
export class RevisionsControllerV2 extends BaseHttpController {
  constructor(@inject(TYPES.HTTPService) private httpService: HttpServiceInterface) {
    super()
  }

  @httpGet('/')
  async getRevisions(request: Request, response: Response): Promise<void> {
    await this.httpService.callRevisionsServer(request, response, `items/${request.params.item_id}/revisions`)
  }
}
