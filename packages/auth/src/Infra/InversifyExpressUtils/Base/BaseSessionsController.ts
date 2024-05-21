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
    const authCookies = new Map<string, string[]>()
    request.headers.cookie?.split(';').forEach((cookie) => {
      const parts = cookie.split('=')
      if (parts.length === 2 && parts[0].trim().startsWith('access_token_')) {
        const existingCookies = authCookies.get(parts[0].trim())
        if (existingCookies) {
          existingCookies.push(parts[1].trim())
          authCookies.set(parts[0].trim(), existingCookies)
        } else {
          authCookies.set(parts[0].trim(), [parts[1].trim()])
        }
      }
    })

    const authenticateRequestResponse = await this.authenticateRequest.execute({
      authTokenFromHeaders: request.body.authTokenFromHeaders,
      authCookies,
      requestMetadata: {
        snjs: request.headers['x-snjs-version'] as string,
        application: request.headers['x-application-version'] as string,
        url: request.headers['x-origin-url'] as string,
        method: request.headers['x-origin-method'] as string,
        userAgent: request.headers['x-origin-user-agent'] as string,
        secChUa: request.headers['x-origin-sec-ch-ua'] as string,
      },
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

    const sharedVaultOwnerContext = request.body.sharedVaultOwnerContext as string | undefined

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
