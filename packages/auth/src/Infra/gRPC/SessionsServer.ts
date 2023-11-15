import * as grpc from '@grpc/grpc-js'
import { Status } from '@grpc/grpc-js/build/src/constants'

import { AuthorizationHeader, ISessionsServer, SessionValidationResponse } from '@standardnotes/grpc'

import { AuthenticateRequest } from '../../Domain/UseCase/AuthenticateRequest'
import { User } from '../../Domain/User/User'
import { CreateCrossServiceToken } from '../../Domain/UseCase/CreateCrossServiceToken/CreateCrossServiceToken'

export class SessionsServer implements ISessionsServer {
  constructor(
    private authenticateRequest: AuthenticateRequest,
    private createCrossServiceToken: CreateCrossServiceToken,
  ) {}

  // [methodName: string]: grpc.UntypedHandleCall

  async validate(
    call: grpc.ServerUnaryCall<AuthorizationHeader, SessionValidationResponse>,
    callback: grpc.sendUnaryData<SessionValidationResponse>,
  ): Promise<void> {
    const authenticateRequestResponse = await this.authenticateRequest.execute({
      authorizationHeader: call.request.getBearerToken(),
    })

    if (!authenticateRequestResponse.success) {
      return callback(
        {
          code: Status.PERMISSION_DENIED,
          message: authenticateRequestResponse.errorMessage,
          name: authenticateRequestResponse.errorTag,
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
      return callback(
        {
          code: Status.INVALID_ARGUMENT,
          message: resultOrError.getError(),
          name: 'INVALID_ARGUMENT',
        },
        null,
      )
    }

    const response = new SessionValidationResponse()
    response.setCrossServiceToken(resultOrError.getValue())

    callback(null, response)
  }
}
