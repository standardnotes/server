import { Logger } from 'winston'
import { HttpResponse, HttpStatusCode } from '@standardnotes/responses'

import { GetRevisionsMetada } from '../Domain/UseCase/GetRevisionsMetada/GetRevisionsMetada'
import { GetRevisionsMetadataRequestParams } from '../Infra/Http/Request/GetRevisionsMetadataRequestParams'
import { GetRevisionRequestParams } from '../Infra/Http/Request/GetRevisionRequestParams'
import { DeleteRevisionRequestParams } from '../Infra/Http/Request/DeleteRevisionRequestParams'
import { GetRevision } from '../Domain/UseCase/GetRevision/GetRevision'
import { DeleteRevision } from '../Domain/UseCase/DeleteRevision/DeleteRevision'
import { GetRevisionsMetadataResponseBody } from '../Infra/Http/Response/GetRevisionsMetadataResponseBody'
import { GetRevisionResponseBody } from '../Infra/Http/Response/GetRevisionResponseBody'
import { MapperInterface } from '@standardnotes/domain-core'
import { Revision } from '../Domain/Revision/Revision'
import { RevisionMetadata } from '../Domain/Revision/RevisionMetadata'

export class RevisionsController {
  constructor(
    private getRevisionsMetadata: GetRevisionsMetada,
    private doGetRevision: GetRevision,
    private doDeleteRevision: DeleteRevision,
    private revisionHttpMapper: MapperInterface<
      Revision,
      {
        uuid: string
        itemUuid: string
        content: string | null
        contentType: string
        itemsKeyId: string | null
        keySystemIdentifier: string | null
        sharedVaultUuid: string | null
        encItemKey: string | null
        authHash: string | null
        createAt: string
        updateAt: string
      }
    >,
    private revisionMetadataHttpMapper: MapperInterface<
      RevisionMetadata,
      {
        uuid: string
        contentType: string
        createdAt: string
        updatedAt: string
      }
    >,
    private logger: Logger,
  ) {}

  async getRevisions(
    params: GetRevisionsMetadataRequestParams,
  ): Promise<HttpResponse<GetRevisionsMetadataResponseBody>> {
    const revisionMetadataOrError = await this.getRevisionsMetadata.execute({
      itemUuid: params.itemUuid,
      userUuid: params.userUuid,
    })

    if (revisionMetadataOrError.isFailed()) {
      this.logger.warn(revisionMetadataOrError.getError())

      return {
        status: HttpStatusCode.BadRequest,
        data: {
          error: {
            message: 'Could not retrieve revisions.',
          },
        },
      }
    }

    const revisions = revisionMetadataOrError.getValue()

    this.logger.debug(`Found ${revisions.length} revisions for item ${params.itemUuid}`)

    return {
      status: HttpStatusCode.Success,
      data: {
        revisions: revisions.map((revision) => this.revisionMetadataHttpMapper.toProjection(revision)),
      },
    }
  }

  async getRevision(params: GetRevisionRequestParams): Promise<HttpResponse<GetRevisionResponseBody>> {
    const revisionOrError = await this.doGetRevision.execute({
      revisionUuid: params.revisionUuid,
      userUuid: params.userUuid,
    })

    if (revisionOrError.isFailed()) {
      this.logger.warn(revisionOrError.getError())

      return {
        status: HttpStatusCode.BadRequest,
        data: {
          error: {
            message: 'Could not retrieve revision.',
          },
        },
      }
    }

    return {
      status: HttpStatusCode.Success,
      data: { revision: this.revisionHttpMapper.toProjection(revisionOrError.getValue()) },
    }
  }

  async deleteRevision(params: DeleteRevisionRequestParams): Promise<HttpResponse> {
    const revisionOrError = await this.doDeleteRevision.execute({
      revisionUuid: params.revisionUuid,
      userUuid: params.userUuid,
    })

    if (revisionOrError.isFailed()) {
      this.logger.warn(revisionOrError.getError())

      return {
        status: HttpStatusCode.BadRequest,
        data: {
          error: {
            message: 'Could not delete revision.',
          },
        },
      }
    }

    return {
      status: HttpStatusCode.Success,
      data: { message: revisionOrError.getValue() },
    }
  }
}
