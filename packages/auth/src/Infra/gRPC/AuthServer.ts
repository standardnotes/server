import * as grpc from '@grpc/grpc-js'
import { Status } from '@grpc/grpc-js/build/src/constants'

import {
  RequestValidationOptions,
  ConnectionValidationResponse,
  IAuthServer,
  SessionValidationResponse,
  WebsocketConnectionAuthorizationHeader,
} from '@standardnotes/grpc'

import { AuthenticateRequest } from '../../Domain/UseCase/AuthenticateRequest'
import { User } from '../../Domain/User/User'
import { CreateCrossServiceToken } from '../../Domain/UseCase/CreateCrossServiceToken/CreateCrossServiceToken'
import { Logger } from 'winston'
import { ErrorTag } from '@standardnotes/responses'
import { TokenDecoderInterface, WebSocketConnectionTokenData } from '@standardnotes/security'

export class AuthServer implements IAuthServer {
  constructor(
    private authenticateRequest: AuthenticateRequest,
    private createCrossServiceToken: CreateCrossServiceToken,
    protected tokenDecoder: TokenDecoderInterface<WebSocketConnectionTokenData>,
    private logger: Logger,
  ) {}

  async validateWebsocket(
    call: grpc.ServerUnaryCall<WebsocketConnectionAuthorizationHeader, ConnectionValidationResponse>,
    callback: grpc.sendUnaryData<ConnectionValidationResponse>,
  ): Promise<void> {
    try {
      const token: WebSocketConnectionTokenData | undefined = this.tokenDecoder.decodeToken(call.request.getToken())

      if (token === undefined) {
        const metadata = new grpc.Metadata()
        metadata.set('x-auth-error-message', 'Invalid authorization token.')
        metadata.set('x-auth-error-tag', ErrorTag.AuthInvalid)
        metadata.set('x-auth-error-response-code', '401')
        return callback(
          {
            code: Status.PERMISSION_DENIED,
            message: 'Invalid authorization token.',
            name: ErrorTag.AuthInvalid,
            metadata,
          },
          null,
        )
      }

      const resultOrError = await this.createCrossServiceToken.execute({
        userUuid: token.userUuid,
        sessionUuid: token.sessionUuid,
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

      const response = new ConnectionValidationResponse()
      response.setCrossServiceToken(resultOrError.getValue())

      this.logger.debug('[SessionsServer] Websocket connection validated via gRPC')

      callback(null, response)
    } catch (error) {
      this.logger.error(`[SessionsServer] Error validating websocket connection via gRPC: ${(error as Error).message}`)

      callback(
        {
          code: Status.UNKNOWN,
          message: 'An error occurred while validating websocket connection',
          name: 'UNKNOWN',
        },
        null,
      )
    }
  }

  async validate(
    call: grpc.ServerUnaryCall<RequestValidationOptions, SessionValidationResponse>,
    callback: grpc.sendUnaryData<SessionValidationResponse>,
  ): Promise<void> {
    try {
      this.logger.debug('[SessionsServer] Validating session via gRPC')

      const cookies = new Map<string, string[]>()
      for (const cookie of call.request.getCookieList()) {
        const existingCookies = cookies.get(cookie.getName())
        if (existingCookies) {
          existingCookies.push(cookie.getValue())
          cookies.set(cookie.getName(), existingCookies)
        } else {
          cookies.set(cookie.getName(), [cookie.getValue()])
        }
      }

      const authenticateRequestResponse = await this.authenticateRequest.execute({
        authTokenFromHeaders: call.request.getBearerToken(),
        authCookies: cookies,
        requestMetadata: {
          snjs: call.metadata.get('x-snjs-version').pop() as string,
          application: call.metadata.get('x-application-version').pop() as string,
          url: call.metadata.get('x-origin-url').pop() as string,
          method: call.metadata.get('x-origin-method').pop() as string,
          userAgent: call.metadata.get('x-origin-user-agent').pop() as string,
          secChUa: call.metadata.get('x-origin-sec-ch-ua').pop() as string,
        },
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

      let sharedVaultOwnerContext = undefined
      if (call.request.hasSharedVaultOwnerContext()) {
        sharedVaultOwnerContext = call.request.getSharedVaultOwnerContext()
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
