import { Request, Response } from 'express'
import { BaseHttpController, controller, httpDelete, httpGet, results } from 'inversify-express-utils'
import { inject } from 'inversify'
import { ControllerContainerInterface } from '@standardnotes/domain-core'

import TYPES from '../../Bootstrap/Types'
import { RevisionsController } from '../../Controller/RevisionsController'

@controller('/items/:itemUuid/revisions', TYPES.Revisions_ApiGatewayAuthMiddleware)
export class InversifyExpressRevisionsController extends BaseHttpController {
  constructor(
    @inject(TYPES.Revisions_RevisionsController) private revisionsController: RevisionsController,
    @inject(TYPES.Revisions_ControllerContainer) private controllerContainer: ControllerContainerInterface,
  ) {
    super()

    this.controllerContainer.register('revisions.revisions.getRevisions', this.getRevisions.bind(this))
    this.controllerContainer.register('revisions.revisions.getRevision', this.getRevision.bind(this))
    this.controllerContainer.register('revisions.revisions.deleteRevision', this.deleteRevision.bind(this))
  }

  @httpGet('/')
  public async getRevisions(req: Request, response: Response): Promise<results.JsonResult> {
    const result = await this.revisionsController.getRevisions({
      itemUuid: req.params.itemUuid,
      userUuid: response.locals.user.uuid,
    })

    return this.json(result.data, result.status)
  }

  @httpGet('/:uuid')
  public async getRevision(req: Request, response: Response): Promise<results.JsonResult> {
    const result = await this.revisionsController.getRevision({
      revisionUuid: req.params.uuid,
      userUuid: response.locals.user.uuid,
    })

    return this.json(result.data, result.status)
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
