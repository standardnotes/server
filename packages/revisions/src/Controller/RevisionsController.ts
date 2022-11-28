import { Logger } from 'winston'
import { HttpResponse, HttpStatusCode } from '@standardnotes/api'

import { GetRevisionsMetada } from '../Domain/UseCase/GetRevisionsMetada/GetRevisionsMetada'
import { GetRevisionsMetadataRequestParams } from '../Infra/Http/GetRevisionsMetadataRequestParams'
import { GetRevisionRequestParams } from '../Infra/Http/GetRevisionRequestParams'
import { GetRevision } from '../Domain/UseCase/GetRevision/GetRevision'

export class RevisionsController {
  constructor(
    private getRevisionsMetadata: GetRevisionsMetada,
    private doGetRevision: GetRevision,
    private logger: Logger,
  ) {}

  async getRevisions(params: GetRevisionsMetadataRequestParams): Promise<HttpResponse> {
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

    return {
      status: HttpStatusCode.Success,
      data: { revisions: revisionMetadataOrError.getValue() },
    }
  }

  async getRevision(params: GetRevisionRequestParams): Promise<HttpResponse> {
    const revisionMetadataOrError = await this.doGetRevision.execute({
      revisionUuid: params.revisionUuid,
      userUuid: params.userUuid,
    })

    if (revisionMetadataOrError.isFailed()) {
      this.logger.warn(revisionMetadataOrError.getError())

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
      data: { revision: revisionMetadataOrError.getValue() },
    }
  }
}
