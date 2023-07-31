import { Request, Response } from 'express'
import { inject } from 'inversify'
import { BaseHttpController, controller, httpDelete, httpGet, httpPatch, httpPost } from 'inversify-express-utils'
import { TYPES } from '../../Bootstrap/Types'
import { ServiceProxyInterface } from '../../Service/Http/ServiceProxyInterface'
import { EndpointResolverInterface } from '../../Service/Resolver/EndpointResolverInterface'

@controller('/v1/shared-vaults', TYPES.ApiGateway_RequiredCrossServiceTokenMiddleware)
export class SharedVaultInvitesController extends BaseHttpController {
  constructor(
    @inject(TYPES.ApiGateway_ServiceProxy) private httpService: ServiceProxyInterface,
    @inject(TYPES.ApiGateway_EndpointResolver) private endpointResolver: EndpointResolverInterface,
  ) {
    super()
  }

  @httpPost('/:sharedVaultUuid/invites')
  async createSharedVaultInvite(request: Request, response: Response): Promise<void> {
    await this.httpService.callSyncingServer(
      request,
      response,
      this.endpointResolver.resolveEndpointOrMethodIdentifier(
        'POST',
        'shared-vaults/:sharedVaultUuid/invites',
        request.params.sharedVaultUuid,
      ),
      request.body,
    )
  }

  @httpPatch('/:sharedVaultUuid/invites/:inviteUuid')
  async updateSharedVaultInvite(request: Request, response: Response): Promise<void> {
    await this.httpService.callSyncingServer(
      request,
      response,
      this.endpointResolver.resolveEndpointOrMethodIdentifier(
        'PATCH',
        'shared-vaults/:sharedVaultUuid/invites/:inviteUuid',
        request.params.sharedVaultUuid,
        request.params.inviteUuid,
      ),
      request.body,
    )
  }

  @httpPost('/:sharedVaultUuid/invites/:inviteUuid/accept')
  async acceptSharedVaultInvite(request: Request, response: Response): Promise<void> {
    await this.httpService.callSyncingServer(
      request,
      response,
      this.endpointResolver.resolveEndpointOrMethodIdentifier(
        'POST',
        'shared-vaults/:sharedVaultUuid/invites/:inviteUuid/accept',
        request.params.sharedVaultUuid,
        request.params.inviteUuid,
      ),
      request.body,
    )
  }

  @httpPost('/:sharedVaultUuid/invites/:inviteUuid/decline')
  async declineSharedVaultInvite(request: Request, response: Response): Promise<void> {
    await this.httpService.callSyncingServer(
      request,
      response,
      this.endpointResolver.resolveEndpointOrMethodIdentifier(
        'POST',
        'shared-vaults/:sharedVaultUuid/invites/:inviteUuid/decline',
        request.params.sharedVaultUuid,
        request.params.inviteUuid,
      ),
      request.body,
    )
  }

  @httpDelete('/invites/inbound')
  async deleteInboundUserInvites(request: Request, response: Response): Promise<void> {
    await this.httpService.callSyncingServer(
      request,
      response,
      this.endpointResolver.resolveEndpointOrMethodIdentifier('DELETE', 'shared-vaults/invites/inbound'),
      request.body,
    )
  }

  @httpDelete('/invites/outbound')
  async deleteOutboundUserInvites(request: Request, response: Response): Promise<void> {
    await this.httpService.callSyncingServer(
      request,
      response,
      this.endpointResolver.resolveEndpointOrMethodIdentifier('DELETE', 'shared-vaults/invites/outbound'),
      request.body,
    )
  }

  @httpGet('/invites/outbound')
  async getOutboundUserInvites(request: Request, response: Response): Promise<void> {
    await this.httpService.callSyncingServer(
      request,
      response,
      this.endpointResolver.resolveEndpointOrMethodIdentifier('GET', 'shared-vaults/invites/outbound'),
      request.body,
    )
  }

  @httpGet('/invites')
  async getUserInvites(request: Request, response: Response): Promise<void> {
    await this.httpService.callSyncingServer(
      request,
      response,
      this.endpointResolver.resolveEndpointOrMethodIdentifier('GET', 'shared-vaults/invites'),
      request.body,
    )
  }

  @httpGet('/:sharedVaultUuid/invites')
  async getSharedVaultInvites(request: Request, response: Response): Promise<void> {
    await this.httpService.callSyncingServer(
      request,
      response,
      this.endpointResolver.resolveEndpointOrMethodIdentifier(
        'GET',
        'shared-vaults/:sharedVaultUuid/invites',
        request.params.sharedVaultUuid,
      ),
      request.body,
    )
  }

  @httpDelete('/:sharedVaultUuid/invites/:inviteUuid')
  async deleteSharedVaultInvite(request: Request, response: Response): Promise<void> {
    await this.httpService.callSyncingServer(
      request,
      response,
      this.endpointResolver.resolveEndpointOrMethodIdentifier(
        'DELETE',
        'shared-vaults/:sharedVaultUuid/invites/:inviteUuid',
        request.params.sharedVaultUuid,
        request.params.inviteUuid,
      ),
      request.body,
    )
  }

  @httpDelete('/:sharedVaultUuid/invites')
  async deleteAllSharedVaultInvites(request: Request, response: Response): Promise<void> {
    await this.httpService.callSyncingServer(
      request,
      response,
      this.endpointResolver.resolveEndpointOrMethodIdentifier(
        'DELETE',
        'shared-vaults/:sharedVaultUuid/invites',
        request.params.sharedVaultUuid,
      ),
      request.body,
    )
  }
}
