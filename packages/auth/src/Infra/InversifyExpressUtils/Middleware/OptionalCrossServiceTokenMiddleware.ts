import { CrossServiceTokenData, TokenDecoderInterface } from '@standardnotes/security'
import { NextFunction, Request, Response } from 'express'
import { inject, injectable } from 'inversify'
import { Logger } from 'winston'

import TYPES from '../../../Bootstrap/Types'
import { ApiGatewayAuthMiddleware } from './ApiGatewayAuthMiddleware'

@injectable()
export class OptionalCrossServiceTokenMiddleware extends ApiGatewayAuthMiddleware {
  constructor(
    @inject(TYPES.Auth_CrossServiceTokenDecoder) tokenDecoder: TokenDecoderInterface<CrossServiceTokenData>,
    @inject(TYPES.Auth_Logger) logger: Logger,
  ) {
    super(tokenDecoder, logger)
  }

  protected override handleMissingToken(request: Request, _response: Response, next: NextFunction): boolean {
    if (!request.headers['x-auth-token']) {
      next()

      return false
    }

    return true
  }
}
