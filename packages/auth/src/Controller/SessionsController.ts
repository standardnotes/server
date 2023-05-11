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
import TYPES from '../Bootstrap/Types'
import { Session } from '../Domain/Session/Session'
import { AuthenticateRequest } from '../Domain/UseCase/AuthenticateRequest'
import { GetActiveSessionsForUser } from '../Domain/UseCase/GetActiveSessionsForUser'
import { User } from '../Domain/User/User'
import { ProjectorInterface } from '../Projection/ProjectorInterface'
import { SessionProjector } from '../Projection/SessionProjector'
import { CreateCrossServiceToken } from '../Domain/UseCase/CreateCrossServiceToken/CreateCrossServiceToken'

@controller('/sessions')
export class SessionsController extends BaseHttpController {
  constructor(
    @inject(TYPES.Auth_GetActiveSessionsForUser) private getActiveSessionsForUser: GetActiveSessionsForUser,
    @inject(TYPES.Auth_AuthenticateRequest) private authenticateRequest: AuthenticateRequest,
    @inject(TYPES.Auth_SessionProjector) private sessionProjector: ProjectorInterface<Session>,
    @inject(TYPES.Auth_CreateCrossServiceToken) private createCrossServiceToken: CreateCrossServiceToken,
  ) {
    super()
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

  @httpGet('/', TYPES.Auth_AuthMiddleware, TYPES.Auth_SessionMiddleware)
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
