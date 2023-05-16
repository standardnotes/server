import { Request, Response } from 'express'
import { inject } from 'inversify'
import { BaseHttpController, controller, httpDelete, httpGet } from 'inversify-express-utils'

import { TYPES } from '../../Bootstrap/Types'
import { ServiceProxyInterface } from '../../Service/Http/ServiceProxyInterface'
import { EndpointResolverInterface } from '../../Service/Resolver/EndpointResolverInterface'

@controller('/v2/items/:itemUuid/revisions', TYPES.AuthMiddleware)
export class RevisionsControllerV2 extends BaseHttpController {
  constructor(
    @inject(TYPES.ServiceProxy) private httpService: ServiceProxyInterface,
    @inject(TYPES.EndpointResolver) private endpointResolver: EndpointResolverInterface,
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

  @httpGet('/:id')
  async getRevision(request: Request, response: Response): Promise<void> {
    await this.httpService.callRevisionsServer(
      request,
      response,
      this.endpointResolver.resolveEndpointOrMethodIdentifier(
        'GET',
        'items/:itemUuid/revisions/:id',
        request.params.itemUuid,
        request.params.id,
      ),
    )
  }

  @httpDelete('/:id')
  async deleteRevision(request: Request, response: Response): Promise<void> {
    await this.httpService.callRevisionsServer(
      request,
      response,
      this.endpointResolver.resolveEndpointOrMethodIdentifier(
        'DELETE',
        'items/:itemUuid/revisions/:id',
        request.params.itemUuid,
        request.params.id,
      ),
    )
  }
}
