import { Logger } from 'winston'
import { HttpResponse, HttpStatusCode } from '@standardnotes/api'

import { GetRevisionsMetada } from '../Domain/UseCase/GetRevisionsMetada/GetRevisionsMetada'
import { GetRevisionsMetadataRequestParams } from '../Infra/Http/GetRevisionsMetadataRequestParams'
import { GetRevisionRequestParams } from '../Infra/Http/GetRevisionRequestParams'
import { GetRevision } from '../Domain/UseCase/GetRevision/GetRevision'
import { DeleteRevision } from '../Domain/UseCase/DeleteRevision/DeleteRevision'
import { DeleteRevisionRequestParams } from '../Infra/Http/DeleteRevisionRequestParams'

export class RevisionsController {
  constructor(
    private getRevisionsMetadata: GetRevisionsMetada,
    private doGetRevision: GetRevision,
    private doDeleteRevision: DeleteRevision,
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
      data: { revision: revisionOrError.getValue() },
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
