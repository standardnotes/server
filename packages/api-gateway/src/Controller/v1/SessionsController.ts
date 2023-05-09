import { Request, Response } from 'express'
import { inject } from 'inversify'
import { BaseHttpController, controller, httpDelete, httpGet, httpPost } from 'inversify-express-utils'
import { TYPES } from '../../Bootstrap/Types'
import { HttpServiceInterface } from '../../Service/Http/HttpServiceInterface'

@controller('/v1/sessions')
export class SessionsController extends BaseHttpController {
  constructor(@inject(TYPES.HTTPService) private httpService: HttpServiceInterface) {
    super()
  }

  @httpGet('/', TYPES.AuthMiddleware)
  async getSessions(request: Request, response: Response): Promise<void> {
    await this.httpService.callAuthServer(request, response, 'sessions')
  }

  @httpDelete('/:uuid', TYPES.AuthMiddleware)
  async deleteSession(request: Request, response: Response): Promise<void> {
    await this.httpService.callAuthServer(request, response, 'session', {
      uuid: request.params.uuid,
    })
  }

  @httpDelete('/', TYPES.AuthMiddleware)
  async deleteSessions(request: Request, response: Response): Promise<void> {
    await this.httpService.callAuthServer(request, response, 'session/all')
  }

  @httpPost('/refresh')
  async refreshSession(request: Request, response: Response): Promise<void> {
    await this.httpService.callAuthServer(request, response, 'session/refresh', request.body)
  }
}
