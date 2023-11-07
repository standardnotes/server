// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { AxiosInstance, AxiosError, AxiosResponse, Method } from 'axios'
import { Request, Response } from 'express'
import { inject, injectable } from 'inversify'
import { Logger } from 'winston'

import { TYPES } from '../../Bootstrap/Types'
import { CrossServiceTokenCacheInterface } from '../Cache/CrossServiceTokenCacheInterface'
import { ServiceProxyInterface } from './ServiceProxyInterface'
import { TimerInterface } from '@standardnotes/time'

@injectable()
export class HttpServiceProxy implements ServiceProxyInterface {
  constructor(
    @inject(TYPES.ApiGateway_HTTPClient) private httpClient: AxiosInstance,
    @inject(TYPES.ApiGateway_AUTH_SERVER_URL) private authServerUrl: string,
    @inject(TYPES.ApiGateway_SYNCING_SERVER_JS_URL) private syncingServerJsUrl: string,
    @inject(TYPES.ApiGateway_PAYMENTS_SERVER_URL) private paymentsServerUrl: string,
    @inject(TYPES.ApiGateway_FILES_SERVER_URL) private filesServerUrl: string,
    @inject(TYPES.ApiGateway_WEB_SOCKET_SERVER_URL) private webSocketServerUrl: string,
    @inject(TYPES.ApiGateway_REVISIONS_SERVER_URL) private revisionsServerUrl: string,
    @inject(TYPES.ApiGateway_EMAIL_SERVER_URL) private emailServerUrl: string,
    @inject(TYPES.ApiGateway_HTTP_CALL_TIMEOUT) private httpCallTimeout: number,
    @inject(TYPES.ApiGateway_CrossServiceTokenCache) private crossServiceTokenCache: CrossServiceTokenCacheInterface,
    @inject(TYPES.ApiGateway_Logger) private logger: Logger,
    @inject(TYPES.ApiGateway_Timer) private timer: TimerInterface,
  ) {}

  async validateSession(
    headers: {
      authorization: string
      sharedVaultOwnerContext?: string
    },
    retryAttempt?: number,
  ): Promise<{ status: number; data: unknown; headers: { contentType: string } }> {
    try {
      const authResponse = await this.httpClient.request({
        method: 'POST',
        headers: {
          Authorization: headers.authorization,
          Accept: 'application/json',
          'x-shared-vault-owner-context': headers.sharedVaultOwnerContext,
        },
        validateStatus: (status: number) => {
          return status >= 200 && status < 500
        },
        url: `${this.authServerUrl}/sessions/validate`,
      })

      return {
        status: authResponse.status,
        data: authResponse.data,
        headers: {
          contentType: authResponse.headers['content-type'] as string,
        },
      }
    } catch (error) {
      const requestDidNotMakeIt = this.requestTimedOutOrDidNotReachDestination(error as Record<string, unknown>)
      const tooManyRetryAttempts = retryAttempt && retryAttempt > 2
      if (!tooManyRetryAttempts && requestDidNotMakeIt) {
        await this.timer.sleep(50)

        const nextRetryAttempt = retryAttempt ? retryAttempt + 1 : 1

        return this.validateSession(headers, nextRetryAttempt)
      }

      throw error
    }
  }

  async callSyncingServer(
    request: Request,
    response: Response,
    endpointOrMethodIdentifier: string,
    payload?: Record<string, unknown> | string,
  ): Promise<void> {
    await this.callServer(this.syncingServerJsUrl, request, response, endpointOrMethodIdentifier, payload)
  }

  async callRevisionsServer(
    request: Request,
    response: Response,
    endpointOrMethodIdentifier: string,
    payload?: Record<string, unknown> | string,
  ): Promise<void> {
    if (!this.revisionsServerUrl) {
      response.status(400).send({ message: 'Revisions Server not configured' })

      return
    }
    await this.callServer(this.revisionsServerUrl, request, response, endpointOrMethodIdentifier, payload)
  }

  async callLegacySyncingServer(
    request: Request,
    response: Response,
    endpointOrMethodIdentifier: string,
    payload?: Record<string, unknown> | string,
  ): Promise<void> {
    await this.callServerWithLegacyFormat(
      this.syncingServerJsUrl,
      request,
      response,
      endpointOrMethodIdentifier,
      payload,
    )
  }

  async callAuthServer(
    request: Request,
    response: Response,
    endpointOrMethodIdentifier: string,
    payload?: Record<string, unknown> | string,
  ): Promise<void> {
    await this.callServer(this.authServerUrl, request, response, endpointOrMethodIdentifier, payload)
  }

  async callEmailServer(
    request: Request,
    response: Response,
    endpointOrMethodIdentifier: string,
    payload?: Record<string, unknown> | string,
  ): Promise<void> {
    if (!this.emailServerUrl) {
      response.status(400).send({ message: 'Email Server not configured' })

      return
    }

    await this.callServer(this.emailServerUrl, request, response, endpointOrMethodIdentifier, payload)
  }

  async callWebSocketServer(
    request: Request,
    response: Response,
    endpointOrMethodIdentifier: string,
    payload?: Record<string, unknown> | string,
  ): Promise<void> {
    if (!this.webSocketServerUrl) {
      this.logger.debug('Websockets Server URL not defined. Skipped request to WebSockets API.')

      return
    }

    await this.callServer(this.webSocketServerUrl, request, response, endpointOrMethodIdentifier, payload)
  }

  async callPaymentsServer(
    request: Request,
    response: Response,
    endpointOrMethodIdentifier: string,
    payload?: Record<string, unknown> | string,
  ): Promise<void | Response<unknown, Record<string, unknown>>> {
    if (!this.paymentsServerUrl) {
      this.logger.debug('Payments Server URL not defined. Skipped request to Payments API.')

      return
    }

    await this.callServerWithLegacyFormat(
      this.paymentsServerUrl,
      request,
      response,
      endpointOrMethodIdentifier,
      payload,
    )
  }

  async callAuthServerWithLegacyFormat(
    request: Request,
    response: Response,
    endpointOrMethodIdentifier: string,
    payload?: Record<string, unknown> | string,
  ): Promise<void> {
    await this.callServerWithLegacyFormat(this.authServerUrl, request, response, endpointOrMethodIdentifier, payload)
  }

  private async getServerResponse(
    serverUrl: string,
    request: Request,
    response: Response,
    endpointOrMethodIdentifier: string,
    payload?: Record<string, unknown> | string,
    retryAttempt?: number,
  ): Promise<AxiosResponse | undefined> {
    try {
      const headers: Record<string, string> = {}
      for (const headerName of Object.keys(request.headers)) {
        headers[headerName] = request.headers[headerName] as string
      }

      delete headers.host
      delete headers['content-length']

      if (response.locals.authToken) {
        headers['X-Auth-Token'] = response.locals.authToken
      }

      if (response.locals.offlineAuthToken) {
        headers['X-Auth-Offline-Token'] = response.locals.offlineAuthToken
      }

      this.logger.debug(`Calling [${request.method}] ${serverUrl}/${endpointOrMethodIdentifier},
        headers: ${JSON.stringify(headers)},
        query: ${JSON.stringify(request.query)},
        payload: ${JSON.stringify(payload)}`)

      const serviceResponse = await this.httpClient.request({
        method: request.method as Method,
        headers,
        url: `${serverUrl}/${endpointOrMethodIdentifier}`,
        data: this.getRequestData(payload),
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        params: request.query,
        timeout: this.httpCallTimeout,
        validateStatus: (status: number) => {
          return status >= 200 && status < 500
        },
      })

      if (serviceResponse.headers['x-invalidate-cache']) {
        const userUuid = serviceResponse.headers['x-invalidate-cache']
        await this.crossServiceTokenCache.invalidate(userUuid)
      }

      if (retryAttempt) {
        this.logger.debug(
          `Request to ${serverUrl}/${endpointOrMethodIdentifier} succeeded after ${retryAttempt} retries`,
        )
      }

      return serviceResponse
    } catch (error) {
      const requestDidNotMakeIt = this.requestTimedOutOrDidNotReachDestination(error as Record<string, unknown>)
      const tooManyRetryAttempts = retryAttempt && retryAttempt > 2
      if (!tooManyRetryAttempts && requestDidNotMakeIt) {
        await this.timer.sleep(50)

        const nextRetryAttempt = retryAttempt ? retryAttempt + 1 : 1

        this.logger.debug(
          `Retrying request to ${serverUrl}/${endpointOrMethodIdentifier} for the ${nextRetryAttempt} time`,
        )

        return this.getServerResponse(
          serverUrl,
          request,
          response,
          endpointOrMethodIdentifier,
          payload,
          nextRetryAttempt,
        )
      }

      let detailedErrorMessage = (error as Error).message
      if (error instanceof AxiosError) {
        detailedErrorMessage = `Status: ${error.status}, code: ${error.code}, message: ${error.message}`
      }

      this.logger.error(
        tooManyRetryAttempts
          ? `Request to ${serverUrl}/${endpointOrMethodIdentifier} timed out after ${retryAttempt} retries`
          : `Could not pass the request to ${serverUrl}/${endpointOrMethodIdentifier} on underlying service: ${detailedErrorMessage}`,
      )

      this.logger.debug(`Response error: ${JSON.stringify(error)}`)

      if ((error as AxiosError).response?.headers['content-type']) {
        response.setHeader('content-type', (error as AxiosError).response?.headers['content-type'] as string)
      }

      const errorCode =
        (error as AxiosError).isAxiosError && !isNaN(+((error as AxiosError).code as string))
          ? +((error as AxiosError).code as string)
          : 500

      const responseErrorMessage = (error as AxiosError).response?.data

      response
        .status(errorCode)
        .send(
          responseErrorMessage ??
            "Unfortunately, we couldn't handle your request. Please try again or contact our support if the error persists.",
        )
    }

    return
  }

  private async callServer(
    serverUrl: string,
    request: Request,
    response: Response,
    endpointOrMethodIdentifier: string,
    payload?: Record<string, unknown> | string,
  ): Promise<void> {
    const serviceResponse = await this.getServerResponse(
      serverUrl,
      request,
      response,
      endpointOrMethodIdentifier,
      payload,
    )

    this.logger.debug(`Response from underlying server: ${JSON.stringify(serviceResponse?.data)},
      headers: ${JSON.stringify(serviceResponse?.headers)}`)

    if (!serviceResponse) {
      return
    }

    this.applyResponseHeaders(serviceResponse, response)

    if (this.responseShouldNotBeDecorated(serviceResponse)) {
      response.status(serviceResponse.status).send(serviceResponse.data)

      return
    }

    response.status(serviceResponse.status).send({
      meta: {
        auth: {
          userUuid: response.locals.user?.uuid,
          roles: response.locals.roles,
        },
        server: {
          filesServerUrl: this.filesServerUrl,
        },
      },
      data: serviceResponse.data,
    })
  }

  private async callServerWithLegacyFormat(
    serverUrl: string,
    request: Request,
    response: Response,
    endpointOrMethodIdentifier: string,
    payload?: Record<string, unknown> | string,
  ): Promise<void | Response<unknown, Record<string, unknown>>> {
    const serviceResponse = await this.getServerResponse(
      serverUrl,
      request,
      response,
      endpointOrMethodIdentifier,
      payload,
    )

    if (!serviceResponse) {
      return
    }

    this.applyResponseHeaders(serviceResponse, response)

    if (serviceResponse.request._redirectable._redirectCount > 0) {
      response.status(302)

      response.redirect(serviceResponse.request.res.responseUrl)
    } else {
      response.status(serviceResponse.status)

      response.send(serviceResponse.data)
    }
  }

  private getRequestData(
    payload: Record<string, unknown> | string | undefined,
  ): Record<string, unknown> | string | undefined {
    if (
      payload === '' ||
      payload === null ||
      payload === undefined ||
      (typeof payload === 'object' && Object.keys(payload).length === 0)
    ) {
      return undefined
    }

    return payload
  }

  private responseShouldNotBeDecorated(serviceResponse: AxiosResponse): boolean {
    return (
      serviceResponse.headers['content-type'] !== undefined &&
      serviceResponse.headers['content-type'].toLowerCase().includes('text/html')
    )
  }

  private applyResponseHeaders(serviceResponse: AxiosResponse, response: Response): void {
    const returnedHeadersFromUnderlyingService = [
      'access-control-allow-methods',
      'access-control-allow-origin',
      'access-control-expose-headers',
      'authorization',
      'content-type',
      'x-ssjs-version',
      'x-auth-version',
    ]

    returnedHeadersFromUnderlyingService.map((headerName) => {
      const headerValue = serviceResponse.headers[headerName]
      if (headerValue) {
        response.setHeader(headerName, headerValue)
      }
    })
  }

  private requestTimedOutOrDidNotReachDestination(error: Record<string, unknown>): boolean {
    return (
      ('code' in error && error.code === 'ETIMEDOUT') ||
      ('response' in error &&
        'status' in (error.response as Record<string, unknown>) &&
        [503, 504].includes((error.response as Record<string, unknown>).status as number))
    )
  }
}
