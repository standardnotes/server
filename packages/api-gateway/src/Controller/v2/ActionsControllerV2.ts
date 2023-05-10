import { Request, Response } from 'express'
import { inject } from 'inversify'
import { BaseHttpController, controller, httpPost } from 'inversify-express-utils'

import { TYPES } from '../../Bootstrap/Types'
import { ServiceProxyInterface } from '../../Service/Http/ServiceProxyInterface'

@controller('/v2')
export class ActionsControllerV2 extends BaseHttpController {
  constructor(@inject(TYPES.HTTPService) private httpService: ServiceProxyInterface) {
    super()
  }

  @httpPost('/login')
  async login(request: Request, response: Response): Promise<void> {
    await this.httpService.callAuthServer(request, response, 'auth/pkce_sign_in', request.body)
  }

  @httpPost('/login-params')
  async loginParams(request: Request, response: Response): Promise<void> {
    await this.httpService.callAuthServer(request, response, 'auth/pkce_params', request.body)
  }
}
