import { Request, Response } from 'express'
import { inject } from 'inversify'
import { BaseHttpController, controller, httpDelete, httpGet, httpPost } from 'inversify-express-utils'

import { TYPES } from '../../Bootstrap/Types'
import { ServiceProxyInterface } from '../../Service/Proxy/ServiceProxyInterface'
import { EndpointResolverInterface } from '../../Service/Resolver/EndpointResolverInterface'

@controller('/v1/subscription-invites')
export class SubscriptionInvitesController extends BaseHttpController {
  constructor(
    @inject(TYPES.ApiGateway_ServiceProxy) private httpService: ServiceProxyInterface,
    @inject(TYPES.ApiGateway_EndpointResolver) private endpointResolver: EndpointResolverInterface,
  ) {
    super()
  }

  @httpPost('/', TYPES.ApiGateway_RequiredCrossServiceTokenMiddleware)
  async inviteToSubscriptionSharing(request: Request, response: Response): Promise<void> {
    await this.httpService.callAuthServer(
      request,
      response,
      this.endpointResolver.resolveEndpointOrMethodIdentifier('POST', 'subscription-invites'),
      request.body,
    )
  }

  @httpGet('/', TYPES.ApiGateway_RequiredCrossServiceTokenMiddleware)
  async listInvites(request: Request, response: Response): Promise<void> {
    await this.httpService.callAuthServer(
      request,
      response,
      this.endpointResolver.resolveEndpointOrMethodIdentifier('GET', 'subscription-invites'),
      request.body,
    )
  }

  @httpDelete('/:inviteUuid', TYPES.ApiGateway_RequiredCrossServiceTokenMiddleware)
  async cancelSubscriptionSharing(request: Request, response: Response): Promise<void> {
    await this.httpService.callAuthServer(
      request,
      response,
      this.endpointResolver.resolveEndpointOrMethodIdentifier(
        'DELETE',
        'subscription-invites/:inviteUuid',
        request.params.inviteUuid,
      ),
    )
  }

  @httpPost('/:inviteUuid/accept', TYPES.ApiGateway_RequiredCrossServiceTokenMiddleware)
  async acceptInvite(request: Request, response: Response): Promise<void> {
    await this.httpService.callAuthServer(
      request,
      response,
      this.endpointResolver.resolveEndpointOrMethodIdentifier(
        'POST',
        'subscription-invites/:inviteUuid/accept',
        request.params.inviteUuid,
      ),
    )
  }
}
