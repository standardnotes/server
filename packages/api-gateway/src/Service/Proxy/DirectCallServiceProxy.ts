import { Request, Response } from 'express'

import { ServiceProxyInterface } from '../Http/ServiceProxyInterface'
import { ServiceContainerInterface, ServiceIdentifier } from '@standardnotes/domain-core'

export class DirectCallServiceProxy implements ServiceProxyInterface {
  constructor(private serviceContainer: ServiceContainerInterface) {}

  async callEmailServer(
    _request: Request,
    _response: Response,
    _endpointOrMethodIdentifier: string,
    _payload?: string | Record<string, unknown> | undefined,
  ): Promise<void> {
    throw new Error('Email server is not available.')
  }

  async callAuthServer(
    request: Request,
    response: Response,
    endpointOrMethodIdentifier: string,
    payload?: string | Record<string, unknown> | undefined,
  ): Promise<void> {
    const authService = this.serviceContainer.get(ServiceIdentifier.create(ServiceIdentifier.NAMES.Auth).getValue())
    if (!authService) {
      throw new Error('Auth service not found')
    }

    return authService.handleRequest(request, response, endpointOrMethodIdentifier, payload)
  }

  async callAuthServerWithLegacyFormat(
    _request: Request,
    _response: Response,
    _endpointOrMethodIdentifier: string,
    _payload?: string | Record<string, unknown> | undefined,
  ): Promise<void> {
    throw new Error('Legacy auth endpoints are no longer available.')
  }

  async callRevisionsServer(
    request: Request,
    response: Response,
    endpointOrMethodIdentifier: string,
    payload?: string | Record<string, unknown> | undefined,
  ): Promise<void> {
    throw new Error('Method not implemented.')
  }

  async callSyncingServer(
    request: Request,
    response: Response,
    endpointOrMethodIdentifier: string,
    payload?: string | Record<string, unknown> | undefined,
  ): Promise<void> {
    throw new Error('Method not implemented.')
  }

  async callLegacySyncingServer(
    _request: Request,
    _response: Response,
    _endpointOrMethodIdentifier: string,
    _payload?: string | Record<string, unknown> | undefined,
  ): Promise<void> {
    throw new Error('Legacy syncing server endpoints are no longer available.')
  }

  async callPaymentsServer(
    _request: Request,
    _response: Response,
    _endpointOrMethodIdentifier: string,
    _payload?: string | Record<string, unknown> | undefined,
  ): Promise<void> {
    throw new Error('Payments server is not available.')
  }

  async callWebSocketServer(
    _request: Request,
    _response: Response,
    _endpointOrMethodIdentifier: string,
    _payload?: string | Record<string, unknown> | undefined,
  ): Promise<void> {
    throw new Error('Websockets server is not available.')
  }
}
