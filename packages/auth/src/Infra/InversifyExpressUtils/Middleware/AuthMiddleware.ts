import { NextFunction, Request, Response } from 'express'
import { inject, injectable } from 'inversify'
import { BaseMiddleware } from 'inversify-express-utils'
import { Logger } from 'winston'
import TYPES from '../../../Bootstrap/Types'
import { AuthenticateRequest } from '../../../Domain/UseCase/AuthenticateRequest'

@injectable()
export class AuthMiddleware extends BaseMiddleware {
  constructor(
    @inject(TYPES.Auth_AuthenticateRequest) private authenticateRequest: AuthenticateRequest,
    @inject(TYPES.Auth_Logger) private logger: Logger,
  ) {
    super()
  }

  async handler(request: Request, response: Response, next: NextFunction): Promise<void> {
    try {
      const authenticateRequestResponse = await this.authenticateRequest.execute({
        authorizationHeader: request.headers.authorization,
      })

      if (!authenticateRequestResponse.success) {
        this.logger.debug('AuthMiddleware authentication failure.')

        response.status(authenticateRequestResponse.responseCode).send({
          error: {
            tag: authenticateRequestResponse.errorTag,
            message: authenticateRequestResponse.errorMessage,
          },
        })

        return
      }

      response.locals.user = authenticateRequestResponse.user
      response.locals.session = authenticateRequestResponse.session
      response.locals.readOnlyAccess = authenticateRequestResponse.session?.readonlyAccess ?? false

      return next()
    } catch (error) {
      return next(error)
    }
  }
}
