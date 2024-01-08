import { CrossServiceTokenData } from '@standardnotes/security'
import { NextFunction, Request, Response } from 'express'
import { inject, injectable } from 'inversify'
import { BaseMiddleware } from 'inversify-express-utils'
import { verify } from 'jsonwebtoken'
import { AxiosError, AxiosInstance } from 'axios'
import { Logger } from 'winston'

import { TYPES } from '../Bootstrap/Types'
import { ResponseLocals } from './ResponseLocals'

@injectable()
export class WebSocketAuthMiddleware extends BaseMiddleware {
  constructor(
    @inject(TYPES.ApiGateway_HTTPClient) private httpClient: AxiosInstance,
    @inject(TYPES.ApiGateway_AUTH_SERVER_URL) private authServerUrl: string,
    @inject(TYPES.ApiGateway_AUTH_JWT_SECRET) private jwtSecret: string,
    @inject(TYPES.ApiGateway_Logger) private logger: Logger,
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

    try {
      const authResponse = await this.httpClient.request({
        method: 'POST',
        headers: {
          Authorization: authHeaderValue,
          Accept: 'application/json',
        },
        validateStatus: (status: number) => {
          return status >= 200 && status < 500
        },
        url: `${this.authServerUrl}/sockets/tokens/validate`,
      })

      if (authResponse.status > 200) {
        response.setHeader('content-type', authResponse.headers['content-type'] as string)
        response.status(authResponse.status).send(authResponse.data)

        return
      }

      const crossServiceToken = authResponse.data.authToken

      const decodedToken = <CrossServiceTokenData>verify(crossServiceToken, this.jwtSecret, { algorithms: ['HS256'] })

      Object.assign(response.locals, {
        authToken: crossServiceToken,
        user: decodedToken.user,
        session: decodedToken.session,
        roles: decodedToken.roles,
      } as ResponseLocals)
    } catch (error) {
      const errorMessage = (error as AxiosError).isAxiosError
        ? JSON.stringify((error as AxiosError).response?.data)
        : (error as Error).message

      this.logger.error(
        `Could not pass the request to ${this.authServerUrl}/sockets/tokens/validate on underlying service: ${errorMessage}`,
      )

      this.logger.debug('Response error: %O', (error as AxiosError).response ?? error)

      if ((error as AxiosError).response?.headers['content-type']) {
        response.setHeader('content-type', (error as AxiosError).response?.headers['content-type'] as string)
      }

      const errorCode =
        (error as AxiosError).isAxiosError && !isNaN(+((error as AxiosError).code as string))
          ? +((error as AxiosError).code as string)
          : 500

      response.status(errorCode).send(errorMessage)

      return
    }

    return next()
  }
}
