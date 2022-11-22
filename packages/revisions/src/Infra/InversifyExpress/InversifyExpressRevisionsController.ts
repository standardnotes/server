import { Request, Response } from 'express'
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
  public async getRevisions(req: Request, response: Response): Promise<results.JsonResult> {
    const result = await this.revisionsController.getRevisions({
      itemUuid: req.params.itemUuid,
      userUuid: response.locals.user.uuid,
    })

    return this.json(result.data, result.status)
  }
}
