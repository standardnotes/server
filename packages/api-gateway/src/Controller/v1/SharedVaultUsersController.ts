import { Request, Response } from 'express'
import { inject } from 'inversify'
import { BaseHttpController, controller, httpDelete, httpGet } from 'inversify-express-utils'
import { TYPES } from '../../Bootstrap/Types'
import { ServiceProxyInterface } from '../../Service/Http/ServiceProxyInterface'
import { EndpointResolverInterface } from '../../Service/Resolver/EndpointResolverInterface'

@controller('/v1/shared-vaults/:sharedVaultUuid/users', TYPES.RequiredCrossServiceTokenMiddleware)
export class SharedVaultUsersController extends BaseHttpController {
  constructor(
    @inject(TYPES.ServiceProxy) private httpService: ServiceProxyInterface,
    @inject(TYPES.EndpointResolver) private endpointResolver: EndpointResolverInterface,
  ) {
    super()
  }

  @httpGet('/')
  async getSharedVaultUsers(request: Request, response: Response): Promise<void> {
    await this.httpService.callSyncingServer(
      request,
      response,
      this.endpointResolver.resolveEndpointOrMethodIdentifier(
        'GET',
        '/shared-vaults/:sharedVaultUuid/users',
        request.params.sharedVaultUuid,
      ),
      request.body,
    )
  }

  @httpDelete('/:userUuid')
  async removeUserFromSharedVault(request: Request, response: Response): Promise<void> {
    await this.httpService.callSyncingServer(
      request,
      response,
      this.endpointResolver.resolveEndpointOrMethodIdentifier(
        'DELETE',
        '/shared-vaults/:sharedVaultUuid/users/:userUuid',
        request.params.sharedVaultUuid,
        request.params.userUuid,
      ),
      request.body,
    )
  }
}
