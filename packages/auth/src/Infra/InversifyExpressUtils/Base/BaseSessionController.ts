import { ControllerContainerInterface } from '@standardnotes/domain-core'
import { Request, Response } from 'express'
import { BaseHttpController, results } from 'inversify-express-utils'
import { ErrorTag } from '@standardnotes/responses'

import { DeleteOtherSessionsForUser } from '../../../Domain/UseCase/DeleteOtherSessionsForUser'
import { DeleteSessionForUser } from '../../../Domain/UseCase/DeleteSessionForUser'
import { RefreshSessionToken } from '../../../Domain/UseCase/RefreshSessionToken'
import { ResponseLocals } from '../ResponseLocals'

export class BaseSessionController extends BaseHttpController {
  constructor(
    protected deleteSessionForUser: DeleteSessionForUser,
    protected deleteOtherSessionsForUser: DeleteOtherSessionsForUser,
    protected refreshSessionToken: RefreshSessionToken,
    private controllerContainer?: ControllerContainerInterface,
  ) {
    super()

    if (this.controllerContainer !== undefined) {
      this.controllerContainer.register('auth.sessions.delete', this.deleteSession.bind(this))
      this.controllerContainer.register('auth.sessions.deleteAll', this.deleteAllSessions.bind(this))
      this.controllerContainer.register('auth.sessions.refresh', this.refresh.bind(this))
    }
  }

  async deleteSession(request: Request, response: Response): Promise<results.JsonResult | results.StatusCodeResult> {
    const locals = response.locals as ResponseLocals

    if (locals.readOnlyAccess) {
      return this.json(
        {
          error: {
            tag: ErrorTag.ReadOnlyAccess,
            message: 'Session has read-only access.',
          },
        },
        401,
      )
    }

    if (!request.body.uuid || !locals.session) {
      return this.json(
        {
          error: {
            message: 'Please provide the session identifier.',
          },
        },
        400,
      )
    }

    if (request.body.uuid === locals.session.uuid) {
      return this.json(
        {
          error: {
            message: 'You can not delete your current session.',
          },
        },
        400,
      )
    }

    const useCaseResponse = await this.deleteSessionForUser.execute({
      userUuid: locals.user.uuid,
      sessionUuid: request.body.uuid,
    })

    if (!useCaseResponse.success) {
      return this.json(
        {
          error: {
            message: useCaseResponse.errorMessage,
          },
        },
        400,
      )
    }

    response.setHeader('x-invalidate-cache', locals.user.uuid)

    return this.statusCode(204)
  }

  async deleteAllSessions(
    _request: Request,
    response: Response,
  ): Promise<results.JsonResult | results.StatusCodeResult> {
    const locals = response.locals as ResponseLocals

    if (locals.readOnlyAccess) {
      return this.json(
        {
          error: {
            tag: ErrorTag.ReadOnlyAccess,
            message: 'Session has read-only access.',
          },
        },
        401,
      )
    }

    if (!locals.user || !locals.session) {
      return this.json(
        {
          error: {
            message: 'No session exists with the provided identifier.',
          },
        },
        401,
      )
    }

    await this.deleteOtherSessionsForUser.execute({
      userUuid: locals.user.uuid,
      currentSessionUuid: locals.session.uuid,
      markAsRevoked: true,
    })

    response.setHeader('x-invalidate-cache', locals.user.uuid)

    return this.statusCode(204)
  }

  async refresh(request: Request, response: Response): Promise<results.JsonResult> {
    if (!request.body.access_token || !request.body.refresh_token) {
      return this.json(
        {
          error: {
            message: 'Please provide all required parameters.',
          },
        },
        400,
      )
    }

    const result = await this.refreshSessionToken.execute({
      accessToken: request.body.access_token,
      refreshToken: request.body.refresh_token,
      userAgent: <string>request.headers['user-agent'],
    })

    if (!result.success) {
      return this.json(
        {
          error: {
            tag: result.errorTag,
            message: result.errorMessage,
          },
        },
        400,
      )
    }

    response.setHeader('x-invalidate-cache', result.userUuid as string)
    return this.json({
      session: result.sessionPayload,
    })
  }
}
