import { SharedVaultValetTokenData, TokenDecoderInterface, ValetTokenOperation } from '@standardnotes/security'
import { Uuid } from '@standardnotes/domain-core'
import { NextFunction, Request, Response } from 'express'
import { inject, injectable } from 'inversify'
import { BaseMiddleware } from 'inversify-express-utils'
import { Logger } from 'winston'

import TYPES from '../../../Bootstrap/Types'
import { SharedVaultValetTokenResponseLocals } from './SharedVaultValetTokenResponseLocals'
import { ValetTokenRepositoryInterface } from '../../../Domain/ValetToken/ValetTokenRepositoryInterface'

@injectable()
export class SharedVaultValetTokenAuthMiddleware extends BaseMiddleware {
  constructor(
    @inject(TYPES.Files_ValetTokenDecoder) private tokenDecoder: TokenDecoderInterface<SharedVaultValetTokenData>,
    @inject(TYPES.Files_ValetTokenRepository) private valetTokenRepository: ValetTokenRepositoryInterface,
    @inject(TYPES.Files_Logger) private logger: Logger,
  ) {
    super()
  }

  async handler(request: Request, response: Response, next: NextFunction): Promise<void> {
    try {
      const valetToken = request.headers['x-valet-token'] || request.body.valetToken || request.query.valetToken
      if (!valetToken) {
        this.logger.debug('SharedVaultValetTokenAuthMiddleware missing valet token.')

        response.status(401).send({
          error: {
            tag: 'invalid-auth',
            message: 'Invalid valet token.',
          },
        })

        return
      }

      if (await this.valetTokenRepository.isUsed(valetToken)) {
        this.logger.debug('Already used valet token.', {
          valetToken,
          codeTag: 'SharedVaultValetTokenAuthMiddleware',
        })

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
        this.logger.debug('SharedVaultValetTokenAuthMiddleware authentication failure.')

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

      if (this.userHasNoSpaceToUpload(valetTokenData)) {
        response.status(403).send({
          error: {
            tag: 'no-space',
            message: 'The file you are trying to upload is too big. Please ask the vault owner to upgrade subscription',
          },
        })

        return
      }

      const whitelistedData: SharedVaultValetTokenResponseLocals = {
        valetToken,
        valetTokenData: {
          sharedVaultUuid: valetTokenData.sharedVaultUuid,
          vaultOwnerUuid: valetTokenData.vaultOwnerUuid,
          remoteIdentifier: valetTokenData.remoteIdentifier,
          permittedOperation: valetTokenData.permittedOperation,
          uploadBytesUsed: valetTokenData.uploadBytesUsed,
          uploadBytesLimit: valetTokenData.uploadBytesLimit,
          unencryptedFileSize: valetTokenData.unencryptedFileSize,
          moveOperation: valetTokenData.moveOperation,
        },
      }

      Object.assign(response.locals, whitelistedData)

      return next()
    } catch (error) {
      return next(error)
    }
  }

  private userHasNoSpaceToUpload(valetTokenData: SharedVaultValetTokenData) {
    if (![ValetTokenOperation.Write, ValetTokenOperation.Move].includes(valetTokenData.permittedOperation)) {
      return false
    }

    if (valetTokenData.uploadBytesLimit === -1) {
      return false
    }

    const isMovingToNonSharedVault =
      valetTokenData.permittedOperation === ValetTokenOperation.Move &&
      valetTokenData.moveOperation?.type === 'shared-vault-to-user'

    if (isMovingToNonSharedVault) {
      return false
    }

    if (valetTokenData.uploadBytesLimit === undefined) {
      return true
    }

    const remainingUploadSpace = valetTokenData.uploadBytesLimit - valetTokenData.uploadBytesUsed

    const consideredUploadSize = valetTokenData.unencryptedFileSize as number

    return remainingUploadSpace - consideredUploadSize <= 0
  }
}
