import { GroupValetTokenData, TokenDecoderInterface } from '@standardnotes/security'
import { Uuid } from '@standardnotes/domain-core'
import { NextFunction, Request, Response } from 'express'
import { inject, injectable } from 'inversify'
import { BaseMiddleware } from 'inversify-express-utils'
import { Logger } from 'winston'
import TYPES from '../Bootstrap/Types'

@injectable()
export class GroupValetTokenAuthMiddleware extends BaseMiddleware {
  constructor(
    @inject(TYPES.ValetTokenDecoder) private tokenDecoder: TokenDecoderInterface<GroupValetTokenData>,
    @inject(TYPES.Logger) private logger: Logger,
  ) {
    super()
  }

  async handler(request: Request, response: Response, next: NextFunction): Promise<void> {
    try {
      const valetToken = request.headers['x-valet-token'] || request.body.valetToken || request.query.valetToken
      if (!valetToken) {
        this.logger.debug('GroupValetTokenAuthMiddleware missing valet token.')

        response.status(401).send({
          error: {
            tag: 'invalid-auth',
            message: 'Invalid valet token.',
          },
        })

        return
      }

      const valetTokenData = this.tokenDecoder.decodeToken(valetToken)

      if (valetTokenData === undefined) {
        this.logger.debug('GroupValetTokenAuthMiddleware authentication failure.')

        response.status(401).send({
          error: {
            tag: 'invalid-auth',
            message: 'Invalid valet token.',
          },
        })

        return
      }

      const resourceUuidOrError = Uuid.create(valetTokenData.remoteIdentifier)
      if (resourceUuidOrError.isFailed()) {
        this.logger.debug('Invalid remote resource identifier in token.')

        response.status(401).send({
          error: {
            tag: 'invalid-auth',
            message: 'Invalid valet token.',
          },
        })

        return
      }

      const whitelistedData: GroupValetTokenData = {
        groupUuid: valetTokenData.groupUuid,
        fileOwnerUuid: valetTokenData.fileOwnerUuid,
        remoteIdentifier: valetTokenData.remoteIdentifier,
        permittedOperation: valetTokenData.permittedOperation,
      }

      Object.assign(response.locals, whitelistedData)

      return next()
    } catch (error) {
      return next(error)
    }
  }
}
