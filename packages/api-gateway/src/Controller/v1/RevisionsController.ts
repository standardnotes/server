import { BaseHttpController, controller, httpDelete, httpGet, results } from 'inversify-express-utils'
import { TYPES } from '../../Bootstrap/Types'

@controller('/v1/items/:item_id/revisions', TYPES.AuthMiddleware)
export class RevisionsController extends BaseHttpController {
  @httpGet('/')
  async getRevisions(): Promise<results.JsonResult> {
    return this.json(
      {
        error: {
          message: 'Please update your client application.',
        },
      },
      410,
    )
  }

  @httpGet('/:id')
  async getRevision(): Promise<results.JsonResult> {
    return this.json(
      {
        error: {
          message: 'Please update your client application.',
        },
      },
      410,
    )
  }

  @httpDelete('/:id')
  async deleteRevision(): Promise<results.JsonResult> {
    return this.json(
      {
        error: {
          message: 'Please update your client application.',
        },
      },
      410,
    )
  }
}
