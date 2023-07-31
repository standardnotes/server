import { Request, Response } from 'express'
import { inject } from 'inversify'
import { BaseHttpController, controller, httpDelete, httpGet, httpPost } from 'inversify-express-utils'
import { TYPES } from '../../Bootstrap/Types'
import { ServiceProxyInterface } from '../../Service/Http/ServiceProxyInterface'
import { EndpointResolverInterface } from '../../Service/Resolver/EndpointResolverInterface'

@controller('/v1/shared-vaults', TYPES.ApiGateway_RequiredCrossServiceTokenMiddleware)
export class SharedVaultsController extends BaseHttpController {
  constructor(
    @inject(TYPES.ApiGateway_ServiceProxy) private httpService: ServiceProxyInterface,
    @inject(TYPES.ApiGateway_EndpointResolver) private endpointResolver: EndpointResolverInterface,
  ) {
    super()
  }

  @httpGet('/')
  async getSharedVaults(request: Request, response: Response): Promise<void> {
    await this.httpService.callSyncingServer(
      request,
      response,
      this.endpointResolver.resolveEndpointOrMethodIdentifier('GET', 'shared-vaults/'),
      request.body,
    )
  }

  @httpPost('/')
  async createSharedVault(request: Request, response: Response): Promise<void> {
    await this.httpService.callSyncingServer(
      request,
      response,
      this.endpointResolver.resolveEndpointOrMethodIdentifier('POST', 'shared-vaults/'),
      request.body,
    )
  }

  @httpDelete('/:sharedVaultUuid')
  async deleteSharedVault(request: Request, response: Response): Promise<void> {
    await this.httpService.callSyncingServer(
      request,
      response,
      this.endpointResolver.resolveEndpointOrMethodIdentifier(
        'DELETE',
        'shared-vaults/:sharedVaultUuid',
        request.params.sharedVaultUuid,
      ),
      request.body,
    )
  }

  @httpPost('/:sharedVaultUuid/valet-tokens')
  async createValetTokenForSharedVaultFile(request: Request, response: Response): Promise<void> {
    await this.httpService.callSyncingServer(
      request,
      response,
      this.endpointResolver.resolveEndpointOrMethodIdentifier(
        'POST',
        'shared-vaults/:sharedVaultUuid/valet-tokens',
        request.params.sharedVaultUuid,
      ),
      request.body,
    )
  }
}
