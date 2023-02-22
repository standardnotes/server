import { Request, Response } from 'express'
import { inject } from 'inversify'
import { all, BaseHttpController, controller } from 'inversify-express-utils'

import TYPES from '../../Bootstrap/Types'
import { HttpServiceInterface } from '../../Service/Http/HttpServiceInterface'

@controller('/v1/proxy')
export class ProxyController extends BaseHttpController {
  constructor(@inject(TYPES.HTTPService) private httpService: HttpServiceInterface) {
    super()
  }

  @all('*', TYPES.AuthMiddleware)
  async createToken(request: Request, response: Response): Promise<void> {
    await this.httpService.callProxyServer(request, response, request.path.replace('/v1/proxy', ''), request.body)
  }
}
