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
    @inject(TYPES.ApiGateway_ServiceProxy) serviceProxy: ServiceProxyInterface,
    @inject(TYPES.ApiGateway_AUTH_JWT_SECRET) jwtSecret: string,
    @inject(TYPES.ApiGateway_CROSS_SERVICE_TOKEN_CACHE_TTL) crossServiceTokenCacheTTL: number,
    @inject(TYPES.ApiGateway_CrossServiceTokenCache) crossServiceTokenCache: CrossServiceTokenCacheInterface,
    @inject(TYPES.ApiGateway_Timer) timer: TimerInterface,
    @inject(TYPES.ApiGateway_Logger) logger: Logger,
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
      this.logger.debug('Missing auth header')

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
