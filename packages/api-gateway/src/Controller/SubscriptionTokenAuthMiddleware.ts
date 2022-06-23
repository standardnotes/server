import { OfflineUserTokenData, CrossServiceTokenData } from '@standardnotes/auth'
import { NextFunction, Request, Response } from 'express'
import { inject, injectable } from 'inversify'
import { BaseMiddleware } from 'inversify-express-utils'
import { verify } from 'jsonwebtoken'
import { AxiosError, AxiosInstance, AxiosResponse } from 'axios'
import { Logger } from 'winston'
import TYPES from '../Bootstrap/Types'
import { TokenAuthenticationMethod } from './TokenAuthenticationMethod'

@injectable()
export class SubscriptionTokenAuthMiddleware extends BaseMiddleware {
  constructor(
    @inject(TYPES.HTTPClient) private httpClient: AxiosInstance,
    @inject(TYPES.AUTH_SERVER_URL) private authServerUrl: string,
    @inject(TYPES.AUTH_JWT_SECRET) private jwtSecret: string,
    @inject(TYPES.Logger) private logger: Logger,
  ) {
    super()
  }

  async handler(request: Request, response: Response, next: NextFunction): Promise<void> {
    const subscriptionToken = request.query.subscription_token
    const email = request.headers['x-offline-email']
    if (!subscriptionToken) {
      response.status(401).send({
        error: {
          tag: 'invalid-auth',
          message: 'Invalid login credentials.',
        },
      })

      return
    }

    response.locals.tokenAuthenticationMethod = email
      ? TokenAuthenticationMethod.OfflineSubscriptionToken
      : TokenAuthenticationMethod.SubscriptionToken

    try {
      const url =
        response.locals.tokenAuthenticationMethod == TokenAuthenticationMethod.OfflineSubscriptionToken
          ? `${this.authServerUrl}/offline/subscription-tokens/${subscriptionToken}/validate`
          : `${this.authServerUrl}/subscription-tokens/${subscriptionToken}/validate`

      const authResponse = await this.httpClient.request({
        method: 'POST',
        headers: {
          Accept: 'application/json',
        },
        data: {
          email,
        },
        validateStatus: (status: number) => {
          return status >= 200 && status < 500
        },
        url,
      })

      if (authResponse.status > 200) {
        response.setHeader('content-type', authResponse.headers['content-type'])
        response.status(authResponse.status).send(authResponse.data)

        return
      }

      if (response.locals.tokenAuthenticationMethod == TokenAuthenticationMethod.OfflineSubscriptionToken) {
        this.handleOfflineAuthTokenValidationResponse(response, authResponse)

        return next()
      }

      this.handleAuthTokenValidationResponse(response, authResponse)

      return next()
    } catch (error) {
      const errorMessage = (error as AxiosError).isAxiosError
        ? JSON.stringify((error as AxiosError).response?.data)
        : (error as Error).message

      this.logger.error(
        `Could not pass the request to ${this.authServerUrl}/subscription-tokens/${subscriptionToken}/validate on underlying service: ${errorMessage}`,
      )

      this.logger.debug('Response error: %O', (error as AxiosError).response ?? error)

      if ((error as AxiosError).response?.headers['content-type']) {
        response.setHeader('content-type', (error as AxiosError).response?.headers['content-type'] as string)
      }

      const errorCode = (error as AxiosError).isAxiosError ? +((error as AxiosError).code as string) : 500

      response.status(errorCode).send(errorMessage)

      return
    }
  }

  private handleOfflineAuthTokenValidationResponse(response: Response, authResponse: AxiosResponse) {
    response.locals.offlineAuthToken = authResponse.data.authToken

    const decodedToken = <OfflineUserTokenData>(
      verify(authResponse.data.authToken, this.jwtSecret, { algorithms: ['HS256'] })
    )

    response.locals.offlineUserEmail = decodedToken.userEmail
    response.locals.offlineFeaturesToken = decodedToken.featuresToken
  }

  private handleAuthTokenValidationResponse(response: Response, authResponse: AxiosResponse) {
    response.locals.authToken = authResponse.data.authToken

    const decodedToken = <CrossServiceTokenData>(
      verify(authResponse.data.authToken, this.jwtSecret, { algorithms: ['HS256'] })
    )

    response.locals.userUuid = decodedToken.user.uuid
    response.locals.roles = decodedToken.roles
  }
}
