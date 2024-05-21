import { Request, Response } from 'express'
import { inject } from 'inversify'
import {
  controller,
  httpDelete,
  httpPost,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  results,
} from 'inversify-express-utils'
import TYPES from '../../Bootstrap/Types'
import { DeleteOtherSessionsForUser } from '../../Domain/UseCase/DeleteOtherSessionsForUser'
import { DeleteSessionForUser } from '../../Domain/UseCase/DeleteSessionForUser'
import { RefreshSessionToken } from '../../Domain/UseCase/RefreshSessionToken'
import { BaseSessionController } from './Base/BaseSessionController'
import { CookieFactoryInterface } from '../../Domain/Auth/Cookies/CookieFactoryInterface'

@controller('/session')
export class AnnotatedSessionController extends BaseSessionController {
  constructor(
    @inject(TYPES.Auth_DeleteSessionForUser) override deleteSessionForUser: DeleteSessionForUser,
    @inject(TYPES.Auth_DeleteOtherSessionsForUser)
    override deleteOtherSessionsForUser: DeleteOtherSessionsForUser,
    @inject(TYPES.Auth_RefreshSessionToken) override refreshSessionToken: RefreshSessionToken,
    @inject(TYPES.Auth_CookieFactory) override cookieFactory: CookieFactoryInterface,
  ) {
    super(deleteSessionForUser, deleteOtherSessionsForUser, refreshSessionToken, cookieFactory)
  }

  @httpDelete('/', TYPES.Auth_RequiredCrossServiceTokenMiddleware, TYPES.Auth_SessionMiddleware)
  override async deleteSession(
    request: Request,
    response: Response,
  ): Promise<results.JsonResult | results.StatusCodeResult> {
    return super.deleteSession(request, response)
  }

  @httpDelete('/all', TYPES.Auth_RequiredCrossServiceTokenMiddleware, TYPES.Auth_SessionMiddleware)
  override async deleteAllSessions(
    _request: Request,
    response: Response,
  ): Promise<results.JsonResult | results.StatusCodeResult> {
    return super.deleteAllSessions(_request, response)
  }

  @httpPost('/refresh')
  override async refresh(request: Request, response: Response): Promise<results.JsonResult> {
    return super.refresh(request, response)
  }
}
