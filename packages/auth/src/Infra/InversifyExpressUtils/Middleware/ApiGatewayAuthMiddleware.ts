import { CrossServiceTokenData, TokenDecoderInterface } from '@standardnotes/security'
import { NextFunction, Request, Response } from 'express'
import { BaseMiddleware } from 'inversify-express-utils'
import { Logger } from 'winston'
import { ResponseLocals } from '../ResponseLocals'

export abstract class ApiGatewayAuthMiddleware extends BaseMiddleware {
  constructor(
    private tokenDecoder: TokenDecoderInterface<CrossServiceTokenData>,
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

      Object.assign(response.locals, {
        user: token.user,
        roles: token.roles,
        session: token.session,
        readOnlyAccess: token.session?.readonly_access ?? false,
      } as ResponseLocals)

      return next()
    } catch (error) {
      return next(error)
    }
  }

  protected abstract handleMissingToken(request: Request, response: Response, next: NextFunction): boolean
}
