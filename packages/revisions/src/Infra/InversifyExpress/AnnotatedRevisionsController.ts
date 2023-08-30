import { Request, Response } from 'express'
import { controller, httpDelete, httpGet, httpPost, results } from 'inversify-express-utils'
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
import { TriggerTransitionFromPrimaryToSecondaryDatabaseForUser } from '../../Domain/UseCase/Transition/TriggerTransitionFromPrimaryToSecondaryDatabaseForUser/TriggerTransitionFromPrimaryToSecondaryDatabaseForUser'

@controller('/', TYPES.Revisions_ApiGatewayAuthMiddleware)
export class AnnotatedRevisionsController extends BaseRevisionsController {
  constructor(
    @inject(TYPES.Revisions_GetRevisionsMetada) override getRevisionsMetadata: GetRevisionsMetada,
    @inject(TYPES.Revisions_GetRevision) override doGetRevision: GetRevision,
    @inject(TYPES.Revisions_DeleteRevision) override doDeleteRevision: DeleteRevision,
    @inject(TYPES.Revisions_RevisionHttpMapper)
    override revisionHttpMapper: MapperInterface<Revision, RevisionHttpRepresentation>,
    @inject(TYPES.Revisions_RevisionMetadataHttpMapper)
    override revisionMetadataHttpMapper: MapperInterface<RevisionMetadata, RevisionMetadataHttpRepresentation>,
    @inject(TYPES.Revisions_TriggerTransitionFromPrimaryToSecondaryDatabaseForUser)
    override triggerTransitionFromPrimaryToSecondaryDatabaseForUser: TriggerTransitionFromPrimaryToSecondaryDatabaseForUser,
  ) {
    super(
      getRevisionsMetadata,
      doGetRevision,
      doDeleteRevision,
      revisionHttpMapper,
      revisionMetadataHttpMapper,
      triggerTransitionFromPrimaryToSecondaryDatabaseForUser,
    )
  }

  @httpGet('/items/:itemUuid/revisions/')
  override async getRevisions(request: Request, response: Response): Promise<results.JsonResult> {
    return super.getRevisions(request, response)
  }

  @httpGet('/items/:itemUuid/revisions/:uuid')
  override async getRevision(request: Request, response: Response): Promise<results.JsonResult> {
    return super.getRevision(request, response)
  }

  @httpDelete('/items/:itemUuid/revisions/:uuid')
  override async deleteRevision(request: Request, response: Response): Promise<results.JsonResult> {
    return super.deleteRevision(request, response)
  }

  @httpPost('/revisions/transition')
  override async transition(request: Request, response: Response): Promise<results.JsonResult> {
    return super.transition(request, response)
  }
}
