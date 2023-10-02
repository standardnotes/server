import { CrossServiceTokenData, TokenDecoderInterface } from '@standardnotes/security'
import { NextFunction, Request, Response } from 'express'
import { Logger } from 'winston'

import { ApiGatewayAuthMiddleware } from './ApiGatewayAuthMiddleware'

export class OptionalCrossServiceTokenMiddleware extends ApiGatewayAuthMiddleware {
  constructor(
    tokenDecoder: TokenDecoderInterface<CrossServiceTokenData>,
    isConfiguredForAWSProduction: boolean,
    logger: Logger,
  ) {
    super(tokenDecoder, isConfiguredForAWSProduction, logger)
  }

  protected override handleMissingToken(request: Request, _response: Response, next: NextFunction): boolean {
    if (!request.headers['x-auth-token']) {
      next()

      return false
    }

    return true
  }
}
