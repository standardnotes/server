import { ErrorTag } from '@standardnotes/responses'
import { Request, Response } from 'express'
import { inject } from 'inversify'
import {
  BaseHttpController,
  controller,
  httpDelete,
  httpPost,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  results,
} from 'inversify-express-utils'
import TYPES from '../../Bootstrap/Types'
import { DeletePreviousSessionsForUser } from '../../Domain/UseCase/DeletePreviousSessionsForUser'
import { DeleteSessionForUser } from '../../Domain/UseCase/DeleteSessionForUser'
import { RefreshSessionToken } from '../../Domain/UseCase/RefreshSessionToken'
import { ControllerContainerInterface } from '@standardnotes/domain-core'

@controller('/session')
export class InversifyExpressSessionController extends BaseHttpController {
  constructor(
    @inject(TYPES.Auth_DeleteSessionForUser) private deleteSessionForUser: DeleteSessionForUser,
    @inject(TYPES.Auth_DeletePreviousSessionsForUser)
    private deletePreviousSessionsForUser: DeletePreviousSessionsForUser,
    @inject(TYPES.Auth_RefreshSessionToken) private refreshSessionToken: RefreshSessionToken,
    @inject(TYPES.Auth_ControllerContainer) private controllerContainer: ControllerContainerInterface,
  ) {
    super()

    this.controllerContainer.register('auth.session.delete', this.deleteSession.bind(this))
    this.controllerContainer.register('auth.session.deleteAll', this.deleteAllSessions.bind(this))
    this.controllerContainer.register('auth.session.refresh', this.refresh.bind(this))
  }

  @httpDelete('/', TYPES.Auth_AuthMiddleware, TYPES.Auth_SessionMiddleware)
  async deleteSession(request: Request, response: Response): Promise<results.JsonResult | void> {
    if (response.locals.readOnlyAccess) {
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

    if (!request.body.uuid) {
      return this.json(
        {
          error: {
            message: 'Please provide the session identifier.',
          },
        },
        400,
      )
    }

    if (request.body.uuid === response.locals.session.uuid) {
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
      userUuid: response.locals.user.uuid,
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

    response.setHeader('x-invalidate-cache', response.locals.user.uuid)
    response.status(204).send()
  }

  @httpDelete('/all', TYPES.Auth_AuthMiddleware, TYPES.Auth_SessionMiddleware)
  async deleteAllSessions(_request: Request, response: Response): Promise<results.JsonResult | void> {
    if (response.locals.readOnlyAccess) {
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

    if (!response.locals.user) {
      return this.json(
        {
          error: {
            message: 'No session exists with the provided identifier.',
          },
        },
        401,
      )
    }

    await this.deletePreviousSessionsForUser.execute({
      userUuid: response.locals.user.uuid,
      currentSessionUuid: response.locals.session.uuid,
    })

    response.setHeader('x-invalidate-cache', response.locals.user.uuid)
    response.status(204).send()
  }

  @httpPost('/refresh')
  async refresh(request: Request, response: Response): Promise<results.JsonResult | void> {
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
    response.send({
      session: result.sessionPayload,
    })
  }
}
