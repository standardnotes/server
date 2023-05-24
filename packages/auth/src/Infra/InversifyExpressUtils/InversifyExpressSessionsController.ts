import { Request, Response } from 'express'
import { inject } from 'inversify'
import {
  BaseHttpController,
  controller,
  httpGet,
  httpPost,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  results,
} from 'inversify-express-utils'
import { ControllerContainerInterface } from '@standardnotes/domain-core'

import TYPES from '../../Bootstrap/Types'
import { AuthenticateRequest } from '../../Domain/UseCase/AuthenticateRequest'
import { CreateCrossServiceToken } from '../../Domain/UseCase/CreateCrossServiceToken/CreateCrossServiceToken'
import { GetActiveSessionsForUser } from '../../Domain/UseCase/GetActiveSessionsForUser'
import { ProjectorInterface } from '../../Projection/ProjectorInterface'
import { SessionProjector } from '../../Projection/SessionProjector'
import { User } from '../../Domain/User/User'
import { Session } from '../../Domain/Session/Session'

@controller('/sessions')
export class InversifyExpressSessionsController extends BaseHttpController {
  constructor(
    @inject(TYPES.Auth_GetActiveSessionsForUser) private getActiveSessionsForUser: GetActiveSessionsForUser,
    @inject(TYPES.Auth_AuthenticateRequest) private authenticateRequest: AuthenticateRequest,
    @inject(TYPES.Auth_SessionProjector) private sessionProjector: ProjectorInterface<Session>,
    @inject(TYPES.Auth_CreateCrossServiceToken) private createCrossServiceToken: CreateCrossServiceToken,
    @inject(TYPES.Auth_ControllerContainer) private controllerContainer: ControllerContainerInterface,
  ) {
    super()

    this.controllerContainer.register('auth.sessions.list', this.getSessions.bind(this))
    this.controllerContainer.register('auth.sessions.validate', this.validate.bind(this))
  }

  @httpPost('/validate')
  async validate(request: Request): Promise<results.JsonResult> {
    const authenticateRequestResponse = await this.authenticateRequest.execute({
      authorizationHeader: request.headers.authorization,
    })

    if (!authenticateRequestResponse.success) {
      return this.json(
        {
          error: {
            tag: authenticateRequestResponse.errorTag,
            message: authenticateRequestResponse.errorMessage,
          },
        },
        authenticateRequestResponse.responseCode,
      )
    }

    const user = authenticateRequestResponse.user as User

    const result = await this.createCrossServiceToken.execute({
      user,
      session: authenticateRequestResponse.session,
    })

    return this.json({ authToken: result.token })
  }

  @httpGet('/', TYPES.Auth_ApiGatewayAuthMiddleware, TYPES.Auth_SessionMiddleware)
  async getSessions(_request: Request, response: Response): Promise<results.JsonResult> {
    if (response.locals.readOnlyAccess) {
      return this.json([])
    }

    const useCaseResponse = await this.getActiveSessionsForUser.execute({
      userUuid: response.locals.user.uuid,
    })

    return this.json(
      useCaseResponse.sessions.map((session) =>
        this.sessionProjector.projectCustom(
          SessionProjector.CURRENT_SESSION_PROJECTION.toString(),
          session,
          response.locals.session,
        ),
      ),
    )
  }
}
