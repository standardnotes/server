import { Logger } from 'winston'
import { HttpResponse, HttpStatusCode } from '@standardnotes/api'

import { GetRevisionsMetada } from '../Domain/UseCase/GetRevisionsMetada/GetRevisionsMetada'
import { GetRevisionsMetadataRequestParams } from '../Infra/Http/GetRevisionsMetadataRequestParams'

export class RevisionsController {
  constructor(private getRevisionsMetadata: GetRevisionsMetada, private logger: Logger) {}

  async getRevisions(params: GetRevisionsMetadataRequestParams): Promise<HttpResponse> {
    const revisionMetadataOrError = await this.getRevisionsMetadata.execute({ itemUuid: params.itemUuid })

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
}
