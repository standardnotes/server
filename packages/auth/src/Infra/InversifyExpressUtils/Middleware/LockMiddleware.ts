import { Username } from '@standardnotes/domain-core'
import { NextFunction, Request, Response } from 'express'
import { inject, injectable } from 'inversify'
import { BaseMiddleware } from 'inversify-express-utils'
import TYPES from '../../../Bootstrap/Types'
import { LockRepositoryInterface } from '../../../Domain/User/LockRepositoryInterface'

import { UserRepositoryInterface } from '../../../Domain/User/UserRepositoryInterface'

@injectable()
export class LockMiddleware extends BaseMiddleware {
  constructor(
    @inject(TYPES.Auth_UserRepository) private userRepository: UserRepositoryInterface,
    @inject(TYPES.Auth_LockRepository) private lockRepository: LockRepositoryInterface,
  ) {
    super()
  }

  async handler(request: Request, response: Response, next: NextFunction): Promise<void> {
    try {
      let identifier = request.body.email ?? request.body.username
      const usernameOrError = Username.create(identifier)
      if (usernameOrError.isFailed()) {
        response.status(400).send({
          error: {
            message: usernameOrError.getError(),
          },
        })
      }
      const username = usernameOrError.getValue()

      const user = await this.userRepository.findOneByUsernameOrEmail(username)
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
