import { Request, Response } from 'express'

export interface ServiceProxyInterface {
  callEmailServer(
    request: Request,
    response: Response,
    endpointOrMethodIdentifier: string,
    payload?: Record<string, unknown> | string,
  ): Promise<void>
  callAuthServer(
    request: Request,
    response: Response,
    endpointOrMethodIdentifier: string,
    payload?: Record<string, unknown> | string,
  ): Promise<void>
  callAuthServerWithLegacyFormat(
    request: Request,
    response: Response,
    endpointOrMethodIdentifier: string,
    payload?: Record<string, unknown> | string,
  ): Promise<void>
  callRevisionsServer(
    request: Request,
    response: Response,
    endpointOrMethodIdentifier: string,
    payload?: Record<string, unknown> | string,
  ): Promise<void>
  callSyncingServer(
    request: Request,
    response: Response,
    endpointOrMethodIdentifier: string,
    payload?: Record<string, unknown> | string,
  ): Promise<void>
  callLegacySyncingServer(
    request: Request,
    response: Response,
    endpointOrMethodIdentifier: string,
    payload?: Record<string, unknown> | string,
  ): Promise<void>
  callPaymentsServer(
    request: Request,
    response: Response,
    endpointOrMethodIdentifier: string,
    payload?: Record<string, unknown> | string,
  ): Promise<void | Response<unknown, Record<string, unknown>>>
  callWebSocketServer(
    request: Request,
    response: Response,
    endpointOrMethodIdentifier: string,
    payload?: Record<string, unknown> | string,
  ): Promise<void>
  validateSession(dto: {
    headers: {
      authorization: string
      sharedVaultOwnerContext?: string
    }
    requestMetadata: {
      url: string
      method: string
      snjs?: string
      application?: string
      userAgent?: string
      secChUa?: string
    }
    cookies?: Map<string, string[]>
    retryAttempt?: number
  }): Promise<{
    status: number
    data: unknown
    headers: {
      contentType: string
    }
  }>
}
