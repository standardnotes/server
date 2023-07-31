import { Request, Response } from 'express'
import { inject } from 'inversify'
import { BaseHttpController, controller, httpDelete, httpGet } from 'inversify-express-utils'

import { TYPES } from '../../Bootstrap/Types'
import { ServiceProxyInterface } from '../../Service/Http/ServiceProxyInterface'
import { EndpointResolverInterface } from '../../Service/Resolver/EndpointResolverInterface'

@controller('/v2/items/:itemUuid/revisions', TYPES.ApiGateway_RequiredCrossServiceTokenMiddleware)
export class RevisionsControllerV2 extends BaseHttpController {
  constructor(
    @inject(TYPES.ApiGateway_ServiceProxy) private httpService: ServiceProxyInterface,
    @inject(TYPES.ApiGateway_EndpointResolver) private endpointResolver: EndpointResolverInterface,
  ) {
    super()
  }

  @httpGet('/')
  async getRevisions(request: Request, response: Response): Promise<void> {
    await this.httpService.callRevisionsServer(
      request,
      response,
      this.endpointResolver.resolveEndpointOrMethodIdentifier(
        'GET',
        'items/:itemUuid/revisions',
        request.params.itemUuid,
      ),
    )
  }

  @httpGet('/:uuid')
  async getRevision(request: Request, response: Response): Promise<void> {
    await this.httpService.callRevisionsServer(
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

  @httpDelete('/:uuid')
  async deleteRevision(request: Request, response: Response): Promise<void> {
    await this.httpService.callRevisionsServer(
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
}
