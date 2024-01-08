import { OfflineUserTokenData, TokenDecoderInterface } from '@standardnotes/security'
import { NextFunction, Request, Response } from 'express'
import { inject, injectable } from 'inversify'
import { BaseMiddleware } from 'inversify-express-utils'
import { Logger } from 'winston'
import TYPES from '../../../Bootstrap/Types'
import { OfflineResponseLocals } from '../OfflineResponseLocals'

@injectable()
export class ApiGatewayOfflineAuthMiddleware extends BaseMiddleware {
  constructor(
    @inject(TYPES.Auth_OfflineUserTokenDecoder) private tokenDecoder: TokenDecoderInterface<OfflineUserTokenData>,
    @inject(TYPES.Auth_Logger) private logger: Logger,
  ) {
    super()
  }

  async handler(request: Request, response: Response, next: NextFunction): Promise<void> {
    try {
      if (!request.headers['x-auth-offline-token']) {
        this.logger.debug('ApiGatewayOfflineAuthMiddleware missing x-auth-offline-token header.')

        response.status(401).send({
          error: {
            tag: 'invalid-auth',
            message: 'Invalid login credentials.',
          },
        })

        return
      }

      const token: OfflineUserTokenData | undefined = this.tokenDecoder.decodeToken(
        request.headers['x-auth-offline-token'] as string,
      )

      this.logger.debug('ApiGatewayOfflineAuthMiddleware decoded token %O', token)

      if (token === undefined) {
        this.logger.debug('ApiGatewayOfflineAuthMiddleware authentication failure.')

        response.status(401).send({
          error: {
            tag: 'invalid-auth',
            message: 'Invalid login credentials.',
          },
        })

        return
      }

      Object.assign(response.locals, {
        featuresToken: token.featuresToken,
        userEmail: token.userEmail,
      } as OfflineResponseLocals)

      return next()
    } catch (error) {
      return next(error)
    }
  }
}
