import { Request, Response } from 'express'
import { inject } from 'inversify'
import { BaseHttpController, controller, httpPost } from 'inversify-express-utils'

import TYPES from '../../Bootstrap/Types'
import { HttpServiceInterface } from '../../Service/Http/HttpServiceInterface'

@controller('/v1/subscription-tokens')
export class TokensController extends BaseHttpController {
  constructor(@inject(TYPES.HTTPService) private httpService: HttpServiceInterface) {
    super()
  }

  @httpPost('/', TYPES.AuthMiddleware)
  async createToken(request: Request, response: Response): Promise<void> {
    await this.httpService.callAuthServer(request, response, 'subscription-tokens', request.body)
  }
}
