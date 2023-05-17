import { NextFunction, Request, Response } from 'express'
import { injectable } from 'inversify'
import { BaseMiddleware } from 'inversify-express-utils'

@injectable()
export class SessionMiddleware extends BaseMiddleware {
  async handler(_request: Request, response: Response, next: NextFunction): Promise<void> {
    try {
      if (!response.locals.session) {
        response.status(400).send({
          error: {
            tag: 'unsupported-account-version',
            message: 'Account version not supported.',
          },
        })

        return
      }

      return next()
    } catch (error) {
      return next(error)
    }
  }
}
