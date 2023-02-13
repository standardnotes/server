import { NextFunction, Request, Response } from 'express'
import { BaseMiddleware } from 'inversify-express-utils'
import { verify } from 'jsonwebtoken'
import { CrossServiceTokenData } from '@standardnotes/security'
import * as winston from 'winston'
import { RoleName } from '@standardnotes/domain-core'

export class AuthMiddleware extends BaseMiddleware {
  constructor(private authJWTSecret: string, private logger: winston.Logger) {
    super()
  }

  async handler(request: Request, response: Response, next: NextFunction): Promise<void> {
    try {
      if (!request.header('X-Auth-Token')) {
        return this.sendInvalidAuthResponse(response)
      }

      const authToken = <string>request.header('X-Auth-Token')

      const decodedToken = <CrossServiceTokenData>verify(authToken, this.authJWTSecret, { algorithms: ['HS256'] })

      response.locals.user = decodedToken.user
      response.locals.roleNames = decodedToken.roles.map((role) => role.name)
      response.locals.freeUser =
        response.locals.roleNames.length === 1 && response.locals.roleNames[0] === RoleName.NAMES.CoreUser
      response.locals.session = decodedToken.session
      response.locals.readOnlyAccess = decodedToken.session?.readonly_access ?? false

      return next()
    } catch (error) {
      this.logger.error(`Could not verify JWT Auth Token ${(error as Error).message}`)

      return this.sendInvalidAuthResponse(response)
    }
  }

  private sendInvalidAuthResponse(response: Response) {
    response.status(401).send({
      error: {
        tag: 'invalid-auth',
        message: 'Invalid login credentials.',
      },
    })
  }
}
