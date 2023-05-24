import { TimerInterface } from '@standardnotes/time'
import { NextFunction, Response } from 'express'
import { inject, injectable } from 'inversify'
import { Logger } from 'winston'

import { TYPES } from '../Bootstrap/Types'
import { CrossServiceTokenCacheInterface } from '../Service/Cache/CrossServiceTokenCacheInterface'
import { ServiceProxyInterface } from '../Service/Http/ServiceProxyInterface'
import { AuthMiddleware } from './AuthMiddleware'

@injectable()
export class RequiredCrossServiceTokenMiddleware extends AuthMiddleware {
  constructor(
    @inject(TYPES.ServiceProxy) serviceProxy: ServiceProxyInterface,
    @inject(TYPES.AUTH_JWT_SECRET) jwtSecret: string,
    @inject(TYPES.CROSS_SERVICE_TOKEN_CACHE_TTL) crossServiceTokenCacheTTL: number,
    @inject(TYPES.CrossServiceTokenCache) crossServiceTokenCache: CrossServiceTokenCacheInterface,
    @inject(TYPES.Timer) timer: TimerInterface,
    @inject(TYPES.Logger) logger: Logger,
  ) {
    super(serviceProxy, jwtSecret, crossServiceTokenCacheTTL, crossServiceTokenCache, timer, logger)
  }

  protected override handleSessionValidationResponse(
    authResponse: { status: number; data: unknown; headers: { contentType: string } },
    response: Response,
    _next: NextFunction,
  ): boolean {
    if (authResponse.status > 200) {
      response.setHeader('content-type', authResponse.headers.contentType)
      response.status(authResponse.status).send(authResponse.data)

      return false
    }

    return true
  }

  protected override handleMissingAuthHeader(
    authHeaderValue: string | undefined,
    response: Response,
    _next: NextFunction,
  ): boolean {
    if (!authHeaderValue) {
      response.status(401).send({
        error: {
          tag: 'invalid-auth',
          message: 'Invalid login credentials.',
        },
      })

      return false
    }

    return true
  }
}
