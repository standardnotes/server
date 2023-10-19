import { HttpStatusCode } from '@standardnotes/responses'
import { BaseHttpController, results } from 'inversify-express-utils'
import { Request, Response } from 'express'
import { ControllerContainerInterface, MapperInterface } from '@standardnotes/domain-core'

import { Revision } from '../../../Domain/Revision/Revision'
import { RevisionMetadata } from '../../../Domain/Revision/RevisionMetadata'
import { DeleteRevision } from '../../../Domain/UseCase/DeleteRevision/DeleteRevision'
import { GetRevision } from '../../../Domain/UseCase/GetRevision/GetRevision'
import { GetRevisionsMetada } from '../../../Domain/UseCase/GetRevisionsMetada/GetRevisionsMetada'
import { RevisionHttpRepresentation } from '../../../Mapping/Http/RevisionHttpRepresentation'
import { RevisionMetadataHttpRepresentation } from '../../../Mapping/Http/RevisionMetadataHttpRepresentation'

export class BaseRevisionsController extends BaseHttpController {
  constructor(
    protected getRevisionsMetadata: GetRevisionsMetada,
    protected doGetRevision: GetRevision,
    protected doDeleteRevision: DeleteRevision,
    protected revisionHttpMapper: MapperInterface<Revision, RevisionHttpRepresentation>,
    protected revisionMetadataHttpMapper: MapperInterface<RevisionMetadata, RevisionMetadataHttpRepresentation>,
    private controllerContainer?: ControllerContainerInterface,
  ) {
    super()

    if (this.controllerContainer !== undefined) {
      this.controllerContainer.register('revisions.revisions.getRevisions', this.getRevisions.bind(this))
      this.controllerContainer.register('revisions.revisions.getRevision', this.getRevision.bind(this))
      this.controllerContainer.register('revisions.revisions.deleteRevision', this.deleteRevision.bind(this))
    }
  }

  async getRevisions(request: Request, response: Response): Promise<results.JsonResult> {
    const revisionMetadataOrError = await this.getRevisionsMetadata.execute({
      itemUuid: request.params.itemUuid,
      userUuid: response.locals.user.uuid,
      sharedVaultUuids: response.locals.belongsToSharedVaults.map(
        (association: { shared_vault_uuid: string; permission: string }) => association.shared_vault_uuid,
      ),
    })

    if (revisionMetadataOrError.isFailed()) {
      return this.json(
        {
          error: {
            message: 'Could not retrieve revisions.',
          },
        },
        HttpStatusCode.BadRequest,
      )
    }
    const revisions = revisionMetadataOrError.getValue()

    return this.json({
      revisions: revisions.map((revision) => this.revisionMetadataHttpMapper.toProjection(revision)),
    })
  }

  async getRevision(request: Request, response: Response): Promise<results.JsonResult> {
    const revisionOrError = await this.doGetRevision.execute({
      revisionUuid: request.params.uuid,
      userUuid: response.locals.user.uuid,
      sharedVaultUuids: response.locals.belongsToSharedVaults.map(
        (association: { shared_vault_uuid: string; permission: string }) => association.shared_vault_uuid,
      ),
    })

    if (revisionOrError.isFailed()) {
      return this.json(
        {
          error: {
            message: revisionOrError.getError(),
          },
        },
        HttpStatusCode.BadRequest,
      )
    }

    return this.json({
      revision: this.revisionHttpMapper.toProjection(revisionOrError.getValue()),
    })
  }

  async deleteRevision(request: Request, response: Response): Promise<results.JsonResult> {
    const revisionOrError = await this.doDeleteRevision.execute({
      revisionUuid: request.params.uuid,
      userUuid: response.locals.user.uuid,
    })

    if (revisionOrError.isFailed()) {
      return this.json(
        {
          error: {
            message: 'Could not delete revision.',
          },
        },
        HttpStatusCode.BadRequest,
      )
    }

    return this.json({
      message: revisionOrError.getValue(),
    })
  }
}
