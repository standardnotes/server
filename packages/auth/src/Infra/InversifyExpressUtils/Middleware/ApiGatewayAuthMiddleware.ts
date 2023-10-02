import { CrossServiceTokenData, TokenDecoderInterface } from '@standardnotes/security'
import { NextFunction, Request, Response } from 'express'
import { BaseMiddleware } from 'inversify-express-utils'
import { Logger } from 'winston'
import { Segment, getSegment } from 'aws-xray-sdk'

export abstract class ApiGatewayAuthMiddleware extends BaseMiddleware {
  constructor(
    private tokenDecoder: TokenDecoderInterface<CrossServiceTokenData>,
    private isConfiguredForAWSProduction: boolean,
    private logger: Logger,
  ) {
    super()
  }

  async handler(request: Request, response: Response, next: NextFunction): Promise<void> {
    try {
      if (!this.handleMissingToken(request, response, next)) {
        return
      }

      const token: CrossServiceTokenData | undefined = this.tokenDecoder.decodeToken(
        request.headers['x-auth-token'] as string,
      )

      if (token === undefined) {
        this.logger.debug('ApiGatewayAuthMiddleware authentication failure.')

        response.status(401).send({
          error: {
            tag: 'invalid-auth',
            message: 'Invalid login credentials.',
          },
        })

        return
      }

      response.locals.user = token.user
      response.locals.roles = token.roles
      response.locals.session = token.session
      response.locals.readOnlyAccess = token.session?.readonly_access ?? false

      if (this.isConfiguredForAWSProduction) {
        const segment = getSegment()
        if (segment instanceof Segment) {
          segment.setUser(token.user.uuid)
        }
      }

      return next()
    } catch (error) {
      return next(error)
    }
  }

  protected abstract handleMissingToken(request: Request, response: Response, next: NextFunction): boolean
}
