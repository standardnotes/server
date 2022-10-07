import { Request, Response } from 'express'

export interface HttpServiceInterface {
  callAuthServer(
    request: Request,
    response: Response,
    endpoint: string,
    payload?: Record<string, unknown> | string,
  ): Promise<void>
  callAuthServerWithLegacyFormat(
    request: Request,
    response: Response,
    endpoint: string,
    payload?: Record<string, unknown> | string,
  ): Promise<void>
  callSyncingServer(
    request: Request,
    response: Response,
    endpoint: string,
    payload?: Record<string, unknown> | string,
  ): Promise<void>
  callLegacySyncingServer(
    request: Request,
    response: Response,
    endpoint: string,
    payload?: Record<string, unknown> | string,
  ): Promise<void>
  callPaymentsServer(
    request: Request,
    response: Response,
    endpoint: string,
    payload?: Record<string, unknown> | string,
  ): Promise<void>
  callWorkspaceServer(
    request: Request,
    response: Response,
    endpoint: string,
    payload?: Record<string, unknown> | string,
  ): Promise<void>
}
