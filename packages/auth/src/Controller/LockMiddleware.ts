import { NextFunction, Request, Response } from 'express'
import { inject, injectable } from 'inversify'
import { BaseMiddleware } from 'inversify-express-utils'
import TYPES from '../Bootstrap/Types'
import { LockRepositoryInterface } from '../Domain/User/LockRepositoryInterface'

import { UserRepositoryInterface } from '../Domain/User/UserRepositoryInterface'

@injectable()
export class LockMiddleware extends BaseMiddleware {
  constructor(
    @inject(TYPES.UserRepository) private userRepository: UserRepositoryInterface,
    @inject(TYPES.LockRepository) private lockRepository: LockRepositoryInterface,
  ) {
    super()
  }

  async handler(request: Request, response: Response, next: NextFunction): Promise<void> {
    try {
      let identifier = request.body.email

      const user = await this.userRepository.findOneByEmail(identifier)
      if (user !== null) {
        identifier = user.uuid
      }

      if (await this.lockRepository.isUserLocked(identifier)) {
        response.status(423).send({
          error: {
            message: 'Too many successive login requests. Please try your request again later.',
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
