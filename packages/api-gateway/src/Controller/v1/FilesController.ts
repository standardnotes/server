import { Request, Response } from 'express'
import { inject } from 'inversify'
import { BaseHttpController, controller, httpPost } from 'inversify-express-utils'

import { TYPES } from '../../Bootstrap/Types'
import { ServiceProxyInterface } from '../../Service/Http/ServiceProxyInterface'

@controller('/v1/files')
export class FilesController extends BaseHttpController {
  constructor(@inject(TYPES.ServiceProxy) private httpService: ServiceProxyInterface) {
    super()
  }

  @httpPost('/valet-tokens', TYPES.AuthMiddleware)
  async createToken(request: Request, response: Response): Promise<void> {
    await this.httpService.callAuthServer(request, response, 'valet-tokens', request.body)
  }
}
