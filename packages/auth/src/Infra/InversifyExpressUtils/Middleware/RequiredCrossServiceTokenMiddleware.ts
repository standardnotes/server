import { CrossServiceTokenData, TokenDecoderInterface } from '@standardnotes/security'
import { NextFunction, Request, Response } from 'express'
import { inject, injectable } from 'inversify'
import { Logger } from 'winston'

import TYPES from '../../../Bootstrap/Types'
import { ApiGatewayAuthMiddleware } from './ApiGatewayAuthMiddleware'

@injectable()
export class RequiredCrossServiceTokenMiddleware extends ApiGatewayAuthMiddleware {
  constructor(
    @inject(TYPES.Auth_CrossServiceTokenDecoder) tokenDecoder: TokenDecoderInterface<CrossServiceTokenData>,
    @inject(TYPES.Auth_Logger) logger: Logger,
  ) {
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
