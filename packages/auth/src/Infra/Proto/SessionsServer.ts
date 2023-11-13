import * as grpc from '@grpc/grpc-js'

import { AuthorizationHeader, ISessionsServer, SessionValidationResponse } from '@standardnotes/grpc'

export class SessionsServer implements ISessionsServer {
  [methodName: string]: grpc.UntypedHandleCall

  validate(
    call: grpc.ServerUnaryCall<AuthorizationHeader, SessionValidationResponse>,
    callback: grpc.sendUnaryData<SessionValidationResponse>,
  ): void {
    call.on('data', (data: AuthorizationHeader) => {
      // eslint-disable-next-line no-console
      console.log(data)

      const response = new SessionValidationResponse()
      response.setCrossServiceToken('token')

      callback(null, response)
    })
  }
}
