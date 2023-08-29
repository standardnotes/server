import { Request, Response } from 'express'
import { controller, httpDelete, httpGet, results } from 'inversify-express-utils'
import { inject } from 'inversify'

import TYPES from '../../Bootstrap/Types'
import { BaseRevisionsController } from './Base/BaseRevisionsController'
import { GetRevisionsMetada } from '../../Domain/UseCase/GetRevisionsMetada/GetRevisionsMetada'
import { GetRevision } from '../../Domain/UseCase/GetRevision/GetRevision'
import { DeleteRevision } from '../../Domain/UseCase/DeleteRevision/DeleteRevision'
import { MapperInterface } from '@standardnotes/domain-core'
import { Revision } from '../../Domain/Revision/Revision'
import { RevisionMetadata } from '../../Domain/Revision/RevisionMetadata'
import { RevisionHttpRepresentation } from '../../Mapping/Http/RevisionHttpRepresentation'
import { RevisionMetadataHttpRepresentation } from '../../Mapping/Http/RevisionMetadataHttpRepresentation'

@controller('/items/:itemUuid/revisions', TYPES.Revisions_ApiGatewayAuthMiddleware)
export class AnnotatedRevisionsController extends BaseRevisionsController {
  constructor(
    @inject(TYPES.Revisions_GetRevisionsMetada) override getRevisionsMetadata: GetRevisionsMetada,
    @inject(TYPES.Revisions_GetRevision) override doGetRevision: GetRevision,
    @inject(TYPES.Revisions_DeleteRevision) override doDeleteRevision: DeleteRevision,
    @inject(TYPES.Revisions_RevisionHttpMapper)
    override revisionHttpMapper: MapperInterface<Revision, RevisionHttpRepresentation>,
    @inject(TYPES.Revisions_RevisionMetadataHttpMapper)
    override revisionMetadataHttpMapper: MapperInterface<RevisionMetadata, RevisionMetadataHttpRepresentation>,
  ) {
    super(getRevisionsMetadata, doGetRevision, doDeleteRevision, revisionHttpMapper, revisionMetadataHttpMapper)
  }

  @httpGet('/')
  override async getRevisions(request: Request, response: Response): Promise<results.JsonResult> {
    return super.getRevisions(request, response)
  }

  @httpGet('/:uuid')
  override async getRevision(request: Request, response: Response): Promise<results.JsonResult> {
    return super.getRevision(request, response)
  }

  @httpDelete('/:uuid')
  override async deleteRevision(request: Request, response: Response): Promise<results.JsonResult> {
    return super.deleteRevision(request, response)
  }
}
