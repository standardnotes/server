import { Request, Response } from 'express'
import { inject } from 'inversify'
import { BaseHttpController, controller, httpDelete, httpGet, httpPost } from 'inversify-express-utils'

import { TYPES } from '../../Bootstrap/Types'
import { ServiceProxyInterface } from '../../Service/Http/ServiceProxyInterface'
import { EndpointResolverInterface } from '../../Service/Resolver/EndpointResolverInterface'

@controller('/v2', TYPES.ApiGateway_RequiredCrossServiceTokenMiddleware)
export class RevisionsControllerV2 extends BaseHttpController {
  constructor(
    @inject(TYPES.ApiGateway_ServiceProxy) private serviceProxy: ServiceProxyInterface,
    @inject(TYPES.ApiGateway_EndpointResolver) private endpointResolver: EndpointResolverInterface,
  ) {
    super()
  }

  @httpGet('/items/:itemUuid/revisions/')
  async getRevisions(request: Request, response: Response): Promise<void> {
    await this.serviceProxy.callRevisionsServer(
      request,
      response,
      this.endpointResolver.resolveEndpointOrMethodIdentifier(
        'GET',
        'items/:itemUuid/revisions',
        request.params.itemUuid,
      ),
    )
  }

  @httpGet('/items/:itemUuid/revisions/:uuid')
  async getRevision(request: Request, response: Response): Promise<void> {
    await this.serviceProxy.callRevisionsServer(
      request,
      response,
      this.endpointResolver.resolveEndpointOrMethodIdentifier(
        'GET',
        'items/:itemUuid/revisions/:id',
        request.params.itemUuid,
        request.params.uuid,
      ),
    )
  }

  @httpDelete('/items/:itemUuid/revisions/:uuid')
  async deleteRevision(request: Request, response: Response): Promise<void> {
    await this.serviceProxy.callRevisionsServer(
      request,
      response,
      this.endpointResolver.resolveEndpointOrMethodIdentifier(
        'DELETE',
        'items/:itemUuid/revisions/:id',
        request.params.itemUuid,
        request.params.uuid,
      ),
    )
  }

  @httpPost('/revisions/transition')
  async transition(request: Request, response: Response): Promise<void> {
    await this.serviceProxy.callSyncingServer(
      request,
      response,
      this.endpointResolver.resolveEndpointOrMethodIdentifier('POST', 'revisions/transition'),
      request.body,
    )
  }
}
