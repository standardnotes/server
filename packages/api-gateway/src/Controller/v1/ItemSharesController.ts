import { Request, Response } from 'express'
import { inject } from 'inversify'
import { BaseHttpController, controller, all, httpGet } from 'inversify-express-utils'
import { TYPES } from '../../Bootstrap/Types'
import { HttpServiceInterface } from '../../Service/Http/HttpServiceInterface'

@controller('/v1/sharing')
export class ItemSharesController extends BaseHttpController {
  constructor(@inject(TYPES.HTTPService) private httpService: HttpServiceInterface) {
    super()
  }

  @httpGet('/item/:shareToken')
  async getSharedItem(request: Request, response: Response): Promise<void> {
    await this.httpService.callSyncingServer(request, response, request.path.replace('/v1/', ''), request.body)
  }

  @all('*', TYPES.AuthMiddleware)
  async subscriptions(request: Request, response: Response): Promise<void> {
    await this.httpService.callSyncingServer(request, response, request.path.replace('/v1/', ''), request.body)
  }
}
