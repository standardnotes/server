import { CrossServiceTokenData } from '@standardnotes/security'
import { RoleName } from '@standardnotes/domain-core'
import { TimerInterface } from '@standardnotes/time'
import { NextFunction, Request, Response } from 'express'
import { BaseMiddleware } from 'inversify-express-utils'
import { verify } from 'jsonwebtoken'
import { AxiosError } from 'axios'
import { Logger } from 'winston'

import { CrossServiceTokenCacheInterface } from '../Service/Cache/CrossServiceTokenCacheInterface'
import { ServiceProxyInterface } from '../Service/Http/ServiceProxyInterface'

export abstract class AuthMiddleware extends BaseMiddleware {
  constructor(
    private serviceProxy: ServiceProxyInterface,
    private jwtSecret: string,
    private crossServiceTokenCacheTTL: number,
    private crossServiceTokenCache: CrossServiceTokenCacheInterface,
    private timer: TimerInterface,
    private logger: Logger,
  ) {
    super()
  }

  async handler(request: Request, response: Response, next: NextFunction): Promise<void> {
    if (!this.handleMissingAuthHeader(request.headers.authorization, response, next)) {
      return
    }

    const authHeaderValue = request.headers.authorization as string

    try {
      let crossServiceTokenFetchedFromCache = true
      let crossServiceToken = null
      if (this.crossServiceTokenCacheTTL) {
        crossServiceToken = await this.crossServiceTokenCache.get(authHeaderValue)
      }

      if (crossServiceToken === null) {
        const authResponse = await this.serviceProxy.validateSession(authHeaderValue)

        if (!this.handleSessionValidationResponse(authResponse, response, next)) {
          return
        }

        crossServiceToken = (authResponse.data as { authToken: string }).authToken
        crossServiceTokenFetchedFromCache = false
      }

      response.locals.authToken = crossServiceToken

      const decodedToken = <CrossServiceTokenData>verify(crossServiceToken, this.jwtSecret, { algorithms: ['HS256'] })

      response.locals.freeUser =
        decodedToken.roles.length === 1 &&
        decodedToken.roles.find((role) => role.name === RoleName.NAMES.CoreUser) !== undefined

      if (this.crossServiceTokenCacheTTL && !crossServiceTokenFetchedFromCache) {
        await this.crossServiceTokenCache.set({
          authorizationHeaderValue: authHeaderValue,
          encodedCrossServiceToken: crossServiceToken,
          expiresAtInSeconds: this.getCrossServiceTokenCacheExpireTimestamp(decodedToken),
          userUuid: decodedToken.user.uuid,
        })
      }

      response.locals.user = decodedToken.user
      response.locals.session = decodedToken.session
      response.locals.roles = decodedToken.roles
    } catch (error) {
      const errorMessage = (error as AxiosError).isAxiosError
        ? JSON.stringify((error as AxiosError).response?.data)
        : (error as Error).message

      this.logger.error(`Could not pass the request to sessions/validate on underlying service: ${errorMessage}`)

      this.logger.debug('Response error: %O', (error as AxiosError).response ?? error)

      if ((error as AxiosError).response?.headers['content-type']) {
        response.setHeader('content-type', (error as AxiosError).response?.headers['content-type'] as string)
      }

      const errorCode =
        (error as AxiosError).isAxiosError && !isNaN(+((error as AxiosError).code as string))
          ? +((error as AxiosError).code as string)
          : 500

      response.status(errorCode).send(errorMessage)

      return
    }

    return next()
  }

  protected abstract handleSessionValidationResponse(
    authResponse: {
      status: number
      data: unknown
      headers: {
        contentType: string
      }
    },
    response: Response,
    next: NextFunction,
  ): boolean

  protected abstract handleMissingAuthHeader(
    authHeaderValue: string | undefined,
    response: Response,
    next: NextFunction,
  ): boolean

  private getCrossServiceTokenCacheExpireTimestamp(token: CrossServiceTokenData): number {
    const crossServiceTokenDefaultCacheExpiration = this.timer.getTimestampInSeconds() + this.crossServiceTokenCacheTTL

    if (token.session === undefined) {
      return crossServiceTokenDefaultCacheExpiration
    }

    const sessionAccessExpiration = this.timer.convertStringDateToSeconds(token.session.access_expiration)
    const sessionRefreshExpiration = this.timer.convertStringDateToSeconds(token.session.refresh_expiration)

    return Math.min(crossServiceTokenDefaultCacheExpiration, sessionAccessExpiration, sessionRefreshExpiration)
  }
}
