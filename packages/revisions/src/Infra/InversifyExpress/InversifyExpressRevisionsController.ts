import { Request, Response } from 'express'
import { BaseHttpController, httpDelete, httpGet, results } from 'inversify-express-utils'
import { inject } from 'inversify'

import TYPES from '../../Bootstrap/Types'
import { RevisionsController } from '../../Controller/RevisionsController'

export class InversifyExpressRevisionsController extends BaseHttpController {
  constructor(@inject(TYPES.RevisionsController) private revisionsController: RevisionsController) {
    super()
  }

  @httpGet('/items/:itemUuid/revisions/', TYPES.ApiGatewayAuthMiddleware)
  public async getRevisions(req: Request, response: Response): Promise<results.JsonResult> {
    const result = await this.revisionsController.getRevisions({
      itemUuid: req.params.itemUuid,
      userUuid: response.locals.user.uuid,
    })

    return this.json(result.data, result.status)
  }

  @httpGet('/items/:itemUuid/revisions/:uuid', TYPES.ApiGatewayAuthMiddleware)
  public async getRevision(req: Request, response: Response): Promise<results.JsonResult> {
    const result = await this.revisionsController.getRevision({
      revisionUuid: req.params.uuid,
      userUuid: response.locals.user.uuid,
    })

    return this.json(result.data, result.status)
  }

  @httpDelete('/items/:itemUuid/revisions/:uuid', TYPES.ApiGatewayAuthMiddleware)
  public async deleteRevision(req: Request, response: Response): Promise<results.JsonResult> {
    const result = await this.revisionsController.deleteRevision({
      revisionUuid: req.params.uuid,
      userUuid: response.locals.user.uuid,
    })

    return this.json(result.data, result.status)
  }
}
