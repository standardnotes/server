import { CrossServiceTokenData } from '@standardnotes/security'
import * as grpc from '@grpc/grpc-js'
import { NextFunction, Request, Response } from 'express'
import { BaseMiddleware } from 'inversify-express-utils'
import { verify } from 'jsonwebtoken'
import { Logger } from 'winston'
import { ConnectionValidationResponse, IAuthClient, WebsocketConnectionAuthorizationHeader } from '@standardnotes/grpc'
import { RoleName } from '@standardnotes/domain-core'

export class GRPCWebSocketAuthMiddleware extends BaseMiddleware {
  constructor(
    private authClient: IAuthClient,
    private jwtSecret: string,
    private logger: Logger,
  ) {
    super()
  }

  async handler(request: Request, response: Response, next: NextFunction): Promise<void> {
    const authHeaderValue = request.headers.authorization as string

    if (!authHeaderValue) {
      response.status(401).send({
        error: {
          tag: 'invalid-auth',
          message: 'Invalid login credentials.',
        },
      })

      return
    }

    const promise = new Promise((resolve, reject) => {
      try {
        const request = new WebsocketConnectionAuthorizationHeader()
        request.setToken(authHeaderValue)

        this.authClient.validateWebsocket(
          request,
          (error: grpc.ServiceError | null, response: ConnectionValidationResponse) => {
            if (error) {
              const responseCode = error.metadata.get('x-auth-error-response-code').pop()
              if (responseCode) {
                return resolve({
                  status: +responseCode,
                  data: {
                    error: {
                      message: error.metadata.get('x-auth-error-message').pop(),
                      tag: error.metadata.get('x-auth-error-tag').pop(),
                    },
                  },
                  headers: {
                    contentType: 'application/json',
                  },
                })
              }

              return reject(error)
            }

            return resolve({
              status: 200,
              data: {
                authToken: response.getCrossServiceToken(),
              },
              headers: {
                contentType: 'application/json',
              },
            })
          },
        )
      } catch (error) {
        return reject(error)
      }
    })

    try {
      const authResponse = (await promise) as {
        status: number
        headers: Record<string, unknown>
        data: Record<string, unknown>
      }

      if (authResponse.status > 200) {
        response.setHeader('content-type', 'application/json')
        response.status(authResponse.status).send(authResponse.data)

        return
      }

      const crossServiceToken = authResponse.data.authToken as string

      response.locals.authToken = crossServiceToken

      const decodedToken = <CrossServiceTokenData>verify(crossServiceToken, this.jwtSecret, { algorithms: ['HS256'] })

      response.locals.user = decodedToken.user
      response.locals.session = decodedToken.session
      response.locals.roles = decodedToken.roles
      response.locals.isFreeUser =
        decodedToken.roles.length === 1 && decodedToken.roles[0].name === RoleName.NAMES.CoreUser
    } catch (error) {
      this.logger.error(
        `Could not pass the request to websocket connection validation on underlying service: ${
          (error as Error).message
        }`,
      )

      response
        .status(500)
        .send(
          "Unfortunately, we couldn't handle your request. Please try again or contact our support if the error persists.",
        )

      return
    }

    return next()
  }
}
