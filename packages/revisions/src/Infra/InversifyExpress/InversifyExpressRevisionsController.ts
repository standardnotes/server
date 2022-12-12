import { Request, Response } from 'express'
import { BaseHttpController, controller, httpDelete, httpGet, results } from 'inversify-express-utils'
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

    return this.json(result.data.error ? result.data : result.data.revisions, result.status)
  }

  @httpGet('/:uuid')
  public async getRevision(req: Request, response: Response): Promise<results.JsonResult> {
    const result = await this.revisionsController.getRevision({
      revisionUuid: req.params.uuid,
      userUuid: response.locals.user.uuid,
    })

    return this.json(result.data.error ? result.data : result.data.revision, result.status)
  }

  @httpDelete('/:uuid')
  public async deleteRevision(req: Request, response: Response): Promise<results.JsonResult> {
    const result = await this.revisionsController.deleteRevision({
      revisionUuid: req.params.uuid,
      userUuid: response.locals.user.uuid,
    })

    return this.json(result.data, result.status)
  }
}
