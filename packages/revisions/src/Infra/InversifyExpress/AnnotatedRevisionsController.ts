import { Request, Response } from 'express'
import { controller, httpDelete, httpGet, results } from 'inversify-express-utils'
import { inject } from 'inversify'

import TYPES from '../../Bootstrap/Types'
import { RevisionsController } from '../../Controller/RevisionsController'
import { BaseRevisionsController } from './Base/BaseRevisionsController'

@controller('/items/:itemUuid/revisions', TYPES.Revisions_ApiGatewayAuthMiddleware)
export class AnnotatedRevisionsController extends BaseRevisionsController {
  constructor(@inject(TYPES.Revisions_RevisionsController) override revisionsController: RevisionsController) {
    super(revisionsController)
  }

  @httpGet('/')
  override async getRevisions(req: Request, response: Response): Promise<results.JsonResult> {
    return super.getRevisions(req, response)
  }

  @httpGet('/:uuid')
  override async getRevision(req: Request, response: Response): Promise<results.JsonResult> {
    return super.getRevision(req, response)
  }

  @httpDelete('/:uuid')
  override async deleteRevision(req: Request, response: Response): Promise<results.JsonResult> {
    return super.deleteRevision(req, response)
  }
}
