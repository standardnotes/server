import { Request, Response } from 'express'
import { inject } from 'inversify'
import { BaseHttpController, controller, httpGet, httpPost } from 'inversify-express-utils'
import { TYPES } from '../../Bootstrap/Types'
import { ServiceProxyInterface } from '../../Service/Http/ServiceProxyInterface'

@controller('/v1/items', TYPES.AuthMiddleware)
export class ItemsController extends BaseHttpController {
  constructor(@inject(TYPES.HTTPService) private httpService: ServiceProxyInterface) {
    super()
  }

  @httpPost('/')
  async sync(request: Request, response: Response): Promise<void> {
    await this.httpService.callSyncingServer(request, response, 'items/sync', request.body)
  }

  @httpPost('/check-integrity')
  async checkIntegrity(request: Request, response: Response): Promise<void> {
    await this.httpService.callSyncingServer(request, response, 'items/check-integrity', request.body)
  }

  @httpGet('/:uuid')
  async getItem(request: Request, response: Response): Promise<void> {
    await this.httpService.callSyncingServer(request, response, `items/${request.params.uuid}`, request.body)
  }
}
