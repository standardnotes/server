import { Request, Response } from 'express'

import { ServiceProxyInterface } from '../Http/ServiceProxyInterface'
import { ServiceContainerInterface, ServiceIdentifier } from '@standardnotes/domain-core'

export class DirectCallServiceProxy implements ServiceProxyInterface {
  constructor(private serviceContainer: ServiceContainerInterface) {}

  async callEmailServer(_request: Request, _response: Response, _endpointOrMethodIdentifier: string): Promise<void> {
    throw new Error('Email server is not available.')
  }

  async callAuthServer(request: never, response: never, endpointOrMethodIdentifier: string): Promise<void> {
    const authService = this.serviceContainer.get(ServiceIdentifier.create(ServiceIdentifier.NAMES.Auth).getValue())
    if (!authService) {
      throw new Error('Auth service not found')
    }

    const serviceResponse = await authService.handleRequest(request, response, endpointOrMethodIdentifier)

    // eslint-disable-next-line no-console
    console.log(`serviceResponse: ${JSON.stringify(serviceResponse)}`)
  }

  async callAuthServerWithLegacyFormat(
    _request: Request,
    _response: Response,
    _endpointOrMethodIdentifier: string,
  ): Promise<void> {
    throw new Error('Legacy auth endpoints are no longer available.')
  }

  async callRevisionsServer(request: never, response: never, endpointOrMethodIdentifier: string): Promise<void> {
    const service = this.serviceContainer.get(ServiceIdentifier.create(ServiceIdentifier.NAMES.Revisions).getValue())
    if (!service) {
      throw new Error('Revisions service not found')
    }

    await service.handleRequest(request, response, endpointOrMethodIdentifier)
  }

  async callSyncingServer(request: never, response: never, endpointOrMethodIdentifier: string): Promise<void> {
    const service = this.serviceContainer.get(
      ServiceIdentifier.create(ServiceIdentifier.NAMES.SyncingServer).getValue(),
    )
    if (!service) {
      throw new Error('Syncing service not found')
    }

    await service.handleRequest(request, response, endpointOrMethodIdentifier)
  }

  async callLegacySyncingServer(
    _request: Request,
    _response: Response,
    _endpointOrMethodIdentifier: string,
  ): Promise<void> {
    throw new Error('Legacy syncing server endpoints are no longer available.')
  }

  async callPaymentsServer(_request: Request, _response: Response, _endpointOrMethodIdentifier: string): Promise<void> {
    throw new Error('Payments server is not available.')
  }

  async callWebSocketServer(
    _request: Request,
    _response: Response,
    _endpointOrMethodIdentifier: string,
  ): Promise<void> {
    throw new Error('Websockets server is not available.')
  }
}
