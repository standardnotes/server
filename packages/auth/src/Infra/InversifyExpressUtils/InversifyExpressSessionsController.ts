import { Request, Response } from 'express'
import { inject } from 'inversify'
import {
  controller,
  httpGet,
  httpPost,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  results,
} from 'inversify-express-utils'

import TYPES from '../../Bootstrap/Types'
import { AuthenticateRequest } from '../../Domain/UseCase/AuthenticateRequest'
import { CreateCrossServiceToken } from '../../Domain/UseCase/CreateCrossServiceToken/CreateCrossServiceToken'
import { GetActiveSessionsForUser } from '../../Domain/UseCase/GetActiveSessionsForUser'
import { ProjectorInterface } from '../../Projection/ProjectorInterface'
import { Session } from '../../Domain/Session/Session'
import { BaseSessionsController } from './Base/BaseSessionsController'

@controller('/sessions')
export class InversifyExpressSessionsController extends BaseSessionsController {
  constructor(
    @inject(TYPES.Auth_GetActiveSessionsForUser) override getActiveSessionsForUser: GetActiveSessionsForUser,
    @inject(TYPES.Auth_AuthenticateRequest) override authenticateRequest: AuthenticateRequest,
    @inject(TYPES.Auth_SessionProjector) override sessionProjector: ProjectorInterface<Session>,
    @inject(TYPES.Auth_CreateCrossServiceToken) override createCrossServiceToken: CreateCrossServiceToken,
  ) {
    super(getActiveSessionsForUser, authenticateRequest, sessionProjector, createCrossServiceToken)
  }

  @httpPost('/validate')
  override async validate(request: Request): Promise<results.JsonResult> {
    return super.validate(request)
  }

  @httpGet('/', TYPES.Auth_RequiredCrossServiceTokenMiddleware, TYPES.Auth_SessionMiddleware)
  override async getSessions(_request: Request, response: Response): Promise<results.JsonResult> {
    return super.getSessions(_request, response)
  }
}
