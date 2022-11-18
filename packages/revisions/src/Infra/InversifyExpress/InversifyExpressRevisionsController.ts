import { Request } from 'express'
import { BaseHttpController, controller, httpGet, results } from 'inversify-express-utils'
import { inject } from 'inversify'

import TYPES from '../../Bootstrap/Types'
import { RevisionsController } from '../../Controller/RevisionsController'

@controller('/items/:itemUuid/revisions', TYPES.ApiGatewayAuthMiddleware)
export class InversifyExpressRevisionsController extends BaseHttpController {
  constructor(@inject(TYPES.RevisionsController) private revisionsController: RevisionsController) {
    super()
  }

  @httpGet('/')
  public async getRevisions(req: Request): Promise<results.JsonResult> {
    const result = await this.revisionsController.getRevisions({
      itemUuid: req.params.itemUuid,
    })

    return this.json(result.data, result.status)
  }
}
