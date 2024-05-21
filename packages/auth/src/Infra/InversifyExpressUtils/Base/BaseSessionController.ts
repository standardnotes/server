import { ControllerContainerInterface } from '@standardnotes/domain-core'
import { Request, Response } from 'express'
import { BaseHttpController, results } from 'inversify-express-utils'
import { ErrorTag } from '@standardnotes/responses'

import { DeleteOtherSessionsForUser } from '../../../Domain/UseCase/DeleteOtherSessionsForUser'
import { DeleteSessionForUser } from '../../../Domain/UseCase/DeleteSessionForUser'
import { RefreshSessionToken } from '../../../Domain/UseCase/RefreshSessionToken'
import { ResponseLocals } from '../ResponseLocals'
import { Session } from '../../../Domain/Session/Session'
import { ApiVersion } from '../../../Domain/Api/ApiVersion'
import { CookieFactoryInterface } from '../../../Domain/Auth/Cookies/CookieFactoryInterface'

export class BaseSessionController extends BaseHttpController {
  constructor(
    protected deleteSessionForUser: DeleteSessionForUser,
    protected deleteOtherSessionsForUser: DeleteOtherSessionsForUser,
    protected refreshSessionToken: RefreshSessionToken,
    protected cookieFactory: CookieFactoryInterface,
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

    const authCookies = new Map<string, string[]>()
    request.headers.cookie?.split(';').forEach((cookie) => {
      const parts = cookie.split('=')
      if (
        parts.length === 2 &&
        (parts[0].trim().startsWith('access_token_') || parts[0].trim().startsWith('refresh_token_'))
      ) {
        const existingCookies = authCookies.get(parts[0].trim())
        if (existingCookies) {
          existingCookies.push(parts[1].trim())
          authCookies.set(parts[0].trim(), existingCookies)
        } else {
          authCookies.set(parts[0].trim(), [parts[1].trim()])
        }
      }
    })

    const refreshResult = await this.refreshSessionToken.execute({
      apiVersion: request.body.api ?? ApiVersion.VERSIONS.v20200115,
      authTokenFromHeaders: request.body.access_token,
      refreshTokenFromHeaders: request.body.refresh_token,
      requestMetadata: {
        snjs: request.headers['x-snjs-version'] as string,
        application: request.headers['x-application-version'] as string,
        url: request.headers['x-origin-url'] as string,
        method: request.headers['x-origin-method'] as string,
        userAgent: request.headers['x-origin-user-agent'] as string,
        secChUa: request.headers['x-origin-sec-ch-ua'] as string,
      },
      authCookies,
    })

    if (!refreshResult.success) {
      return this.json(
        {
          error: {
            tag: refreshResult.errorTag,
            message: refreshResult.errorMessage,
          },
        },
        400,
      )
    }

    const session = refreshResult.result.session as Session

    response.setHeader('x-invalidate-cache', refreshResult.userUuid as string)
    response.setHeader(
      'Set-Cookie',
      this.cookieFactory.createCookieHeaderValue({
        sessionUuid: session.uuid,
        accessToken: refreshResult.result.sessionCookieRepresentation.accessToken,
        refreshToken: refreshResult.result.sessionCookieRepresentation.refreshToken,
        refreshTokenExpiration: session.refreshExpiration,
      }),
    )

    return this.json({
      session: refreshResult.result.sessionHttpRepresentation,
    })
  }
}
