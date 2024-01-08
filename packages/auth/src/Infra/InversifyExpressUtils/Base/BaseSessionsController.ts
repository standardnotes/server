import { ControllerContainerInterface } from '@standardnotes/domain-core'
import { Request, Response } from 'express'

import { AuthenticateRequest } from '../../../Domain/UseCase/AuthenticateRequest'
import { CreateCrossServiceToken } from '../../../Domain/UseCase/CreateCrossServiceToken/CreateCrossServiceToken'
import { GetActiveSessionsForUser } from '../../../Domain/UseCase/GetActiveSessionsForUser'
import { ProjectorInterface } from '../../../Projection/ProjectorInterface'
import { Session } from '../../../Domain/Session/Session'
import { BaseHttpController, results } from 'inversify-express-utils'
import { User } from '../../../Domain/User/User'
import { SessionProjector } from '../../../Projection/SessionProjector'
import { ResponseLocals } from '../ResponseLocals'

export class BaseSessionsController extends BaseHttpController {
  constructor(
    protected getActiveSessionsForUser: GetActiveSessionsForUser,
    protected authenticateRequest: AuthenticateRequest,
    protected sessionProjector: ProjectorInterface<Session>,
    protected createCrossServiceToken: CreateCrossServiceToken,
    private controllerContainer?: ControllerContainerInterface,
  ) {
    super()

    if (this.controllerContainer !== undefined) {
      this.controllerContainer.register('auth.sessions.list', this.getSessions.bind(this))
      this.controllerContainer.register('auth.sessions.validate', this.validate.bind(this))
    }
  }

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

    const sharedVaultOwnerContext = request.headers['x-shared-vault-owner-context'] as string | undefined

    const resultOrError = await this.createCrossServiceToken.execute({
      user,
      session: authenticateRequestResponse.session,
      sharedVaultOwnerContext,
    })
    if (resultOrError.isFailed()) {
      return this.json(
        {
          error: {
            message: resultOrError.getError(),
          },
        },
        400,
      )
    }

    return this.json({ authToken: resultOrError.getValue() })
  }

  async getSessions(_request: Request, response: Response): Promise<results.JsonResult> {
    const locals = response.locals as ResponseLocals

    if (locals.readOnlyAccess) {
      return this.json([])
    }

    const useCaseResponse = await this.getActiveSessionsForUser.execute({
      userUuid: locals.user.uuid,
    })

    return this.json(
      useCaseResponse.sessions.map((session) =>
        this.sessionProjector.projectCustom(
          SessionProjector.CURRENT_SESSION_PROJECTION.toString(),
          session,
          locals.session,
        ),
      ),
    )
  }
}
