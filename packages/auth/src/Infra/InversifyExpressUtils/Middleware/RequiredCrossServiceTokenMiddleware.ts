import { CrossServiceTokenData, TokenDecoderInterface } from '@standardnotes/security'
import { NextFunction, Request, Response } from 'express'
import { Logger } from 'winston'

import { ApiGatewayAuthMiddleware } from './ApiGatewayAuthMiddleware'

export class RequiredCrossServiceTokenMiddleware extends ApiGatewayAuthMiddleware {
  constructor(tokenDecoder: TokenDecoderInterface<CrossServiceTokenData>, logger: Logger) {
    super(tokenDecoder, logger)
  }

  protected override handleMissingToken(request: Request, response: Response, _next: NextFunction): boolean {
    if (!request.headers['x-auth-token']) {
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
