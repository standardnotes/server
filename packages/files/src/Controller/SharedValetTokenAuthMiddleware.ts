import { SharedValetTokenData, TokenDecoderInterface } from '@standardnotes/security'
import { Uuid } from '@standardnotes/domain-core'
import { NextFunction, Request, Response } from 'express'
import { inject, injectable } from 'inversify'
import { BaseMiddleware } from 'inversify-express-utils'
import { Logger } from 'winston'
import TYPES from '../Bootstrap/Types'

@injectable()
export class SharedValetTokenAuthMiddleware extends BaseMiddleware {
  constructor(
    @inject(TYPES.ValetTokenDecoder) private tokenDecoder: TokenDecoderInterface<SharedValetTokenData>,
    @inject(TYPES.Logger) private logger: Logger,
  ) {
    super()
  }

  async handler(request: Request, response: Response, next: NextFunction): Promise<void> {
    try {
      const valetToken = request.headers['x-valet-token'] || request.body.valetToken || request.query.valetToken
      if (!valetToken) {
        this.logger.debug('SharedValetTokenAuthMiddleware missing valet token.')

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
        this.logger.debug('SharedValetTokenAuthMiddleware authentication failure.')

        response.status(401).send({
          error: {
            tag: 'invalid-auth',
            message: 'Invalid valet token.',
          },
        })

        return
      }

      for (const resource of valetTokenData.permittedResources) {
        const resourceUuidOrError = Uuid.create(resource.remoteIdentifier)
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
      }

      response.locals.sharingUserUuid = valetTokenData.sharingUserUuid
      response.locals.permittedResources = valetTokenData.permittedResources
      response.locals.permittedOperation = valetTokenData.permittedOperation

      return next()
    } catch (error) {
      return next(error)
    }
  }
}
