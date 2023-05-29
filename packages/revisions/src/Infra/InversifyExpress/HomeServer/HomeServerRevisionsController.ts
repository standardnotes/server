import { BaseHttpController, results } from 'inversify-express-utils'
import { Request, Response } from 'express'
import { ControllerContainerInterface } from '@standardnotes/domain-core'

import { RevisionsController } from '../../../Controller/RevisionsController'

export class HomeServerRevisionsController extends BaseHttpController {
  constructor(
    protected revisionsController: RevisionsController,
    private controllerContainer?: ControllerContainerInterface,
  ) {
    super()

    if (this.controllerContainer !== undefined) {
      this.controllerContainer.register('revisions.revisions.getRevisions', this.getRevisions.bind(this))
      this.controllerContainer.register('revisions.revisions.getRevision', this.getRevision.bind(this))
      this.controllerContainer.register('revisions.revisions.deleteRevision', this.deleteRevision.bind(this))
    }
  }

  async getRevisions(req: Request, response: Response): Promise<results.JsonResult> {
    const result = await this.revisionsController.getRevisions({
      itemUuid: req.params.itemUuid,
      userUuid: response.locals.user.uuid,
    })

    return this.json(result.data, result.status)
  }

  async getRevision(req: Request, response: Response): Promise<results.JsonResult> {
    const result = await this.revisionsController.getRevision({
      revisionUuid: req.params.uuid,
      userUuid: response.locals.user.uuid,
    })

    return this.json(result.data, result.status)
  }

  async deleteRevision(req: Request, response: Response): Promise<results.JsonResult> {
    const result = await this.revisionsController.deleteRevision({
      revisionUuid: req.params.uuid,
      userUuid: response.locals.user.uuid,
    })

    return this.json(result.data, result.status)
  }
}
