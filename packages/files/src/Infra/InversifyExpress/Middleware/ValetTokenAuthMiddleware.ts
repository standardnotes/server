import { TokenDecoderInterface, ValetTokenData } from '@standardnotes/security'
import { Uuid } from '@standardnotes/domain-core'
import { NextFunction, Request, Response } from 'express'
import { inject, injectable } from 'inversify'
import { BaseMiddleware } from 'inversify-express-utils'
import { Logger } from 'winston'
import TYPES from '../../../Bootstrap/Types'

@injectable()
export class ValetTokenAuthMiddleware extends BaseMiddleware {
  constructor(
    @inject(TYPES.Files_ValetTokenDecoder) private tokenDecoder: TokenDecoderInterface<ValetTokenData>,
    @inject(TYPES.Files_Logger) private logger: Logger,
  ) {
    super()
  }

  async handler(request: Request, response: Response, next: NextFunction): Promise<void> {
    try {
      const valetToken = request.headers['x-valet-token'] || request.body.valetToken || request.query.valetToken
      if (!valetToken) {
        this.logger.debug('ValetTokenAuthMiddleware missing valet token.')

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
        this.logger.debug('ValetTokenAuthMiddleware authentication failure.')

        response.status(401).send({
          error: {
            tag: 'invalid-auth',
            message: 'Invalid valet token.',
          },
        })

        return
      }

      if (valetTokenData.ongoingTransition === true) {
        this.logger.error(`Cannot perform file operations for user ${valetTokenData.userUuid} during transition`)

        response.status(500).send({
          error: {
            tag: 'ongoing-transition',
            message: 'Cannot perform file operations during transition',
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

      if (this.userHasNoSpaceToUpload(valetTokenData)) {
        response.status(403).send({
          error: {
            tag: 'no-space',
            message: 'The file you are trying to upload is too big. Please upgrade your subscription',
          },
        })

        return
      }

      response.locals.userUuid = valetTokenData.userUuid
      response.locals.permittedResources = valetTokenData.permittedResources
      response.locals.permittedOperation = valetTokenData.permittedOperation
      response.locals.uploadBytesUsed = valetTokenData.uploadBytesUsed
      response.locals.uploadBytesLimit = valetTokenData.uploadBytesLimit
      response.locals.regularSubscriptionUuid = valetTokenData.regularSubscriptionUuid

      return next()
    } catch (error) {
      return next(error)
    }
  }

  private userHasNoSpaceToUpload(valetTokenData: ValetTokenData) {
    if (valetTokenData.permittedOperation !== 'write') {
      return false
    }

    if (valetTokenData.uploadBytesLimit === -1) {
      return false
    }

    const remainingUploadSpace = valetTokenData.uploadBytesLimit - valetTokenData.uploadBytesUsed

    let consideredUploadSize = 0
    for (const resource of valetTokenData.permittedResources) {
      consideredUploadSize += resource.unencryptedFileSize as number
    }

    return remainingUploadSpace - consideredUploadSize <= 0
  }
}
