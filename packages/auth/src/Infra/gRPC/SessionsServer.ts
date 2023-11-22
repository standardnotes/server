import * as grpc from '@grpc/grpc-js'
import { Status } from '@grpc/grpc-js/build/src/constants'

import { AuthorizationHeader, ISessionsServer, SessionValidationResponse } from '@standardnotes/grpc'

import { AuthenticateRequest } from '../../Domain/UseCase/AuthenticateRequest'
import { User } from '../../Domain/User/User'
import { CreateCrossServiceToken } from '../../Domain/UseCase/CreateCrossServiceToken/CreateCrossServiceToken'
import { Logger } from 'winston'

export class SessionsServer implements ISessionsServer {
  constructor(
    private authenticateRequest: AuthenticateRequest,
    private createCrossServiceToken: CreateCrossServiceToken,
    private logger: Logger,
  ) {}

  async validate(
    call: grpc.ServerUnaryCall<AuthorizationHeader, SessionValidationResponse>,
    callback: grpc.sendUnaryData<SessionValidationResponse>,
  ): Promise<void> {
    try {
      this.logger.debug('[SessionsServer] Validating session via gRPC')

      const authenticateRequestResponse = await this.authenticateRequest.execute({
        authorizationHeader: call.request.getBearerToken(),
      })

      if (!authenticateRequestResponse.success) {
        const metadata = new grpc.Metadata()
        metadata.set('x-auth-error-message', authenticateRequestResponse.errorMessage as string)
        metadata.set('x-auth-error-tag', authenticateRequestResponse.errorTag as string)
        metadata.set('x-auth-error-response-code', authenticateRequestResponse.responseCode.toString())
        return callback(
          {
            code: Status.PERMISSION_DENIED,
            message: authenticateRequestResponse.errorMessage,
            name: authenticateRequestResponse.errorTag,
            metadata,
          },
          null,
        )
      }

      const user = authenticateRequestResponse.user as User

      const sharedVaultOwnerMetadata = call.metadata.get('x-shared-vault-owner-context')
      let sharedVaultOwnerContext = undefined
      if (sharedVaultOwnerMetadata.length > 0 && sharedVaultOwnerMetadata[0].length > 0) {
        sharedVaultOwnerContext = sharedVaultOwnerMetadata[0].toString()
      }

      const resultOrError = await this.createCrossServiceToken.execute({
        user,
        session: authenticateRequestResponse.session,
        sharedVaultOwnerContext,
      })
      if (resultOrError.isFailed()) {
        const metadata = new grpc.Metadata()
        metadata.set('x-auth-error-message', resultOrError.getError())
        metadata.set('x-auth-error-response-code', '400')

        return callback(
          {
            code: Status.INVALID_ARGUMENT,
            message: resultOrError.getError(),
            name: 'INVALID_ARGUMENT',
            metadata,
          },
          null,
        )
      }

      const response = new SessionValidationResponse()
      response.setCrossServiceToken(resultOrError.getValue())

      this.logger.debug('[SessionsServer] Session validated via gRPC')

      callback(null, response)
    } catch (error) {
      this.logger.error(`[SessionsServer] Error validating session via gRPC: ${(error as Error).message}`)

      callback(
        {
          code: Status.UNKNOWN,
          message: 'An error occurred while validating session',
          name: 'UNKNOWN',
        },
        null,
      )
    }
  }
}
