import { HttpErrorResponseBody, HttpResponse } from '@standardnotes/api'
import { Either } from '@standardnotes/common'

import { GetRevisionsMetadataResponseBody } from './GetRevisionsMetadataResponseBody'

export interface GetRevisionsMetadataResponse extends HttpResponse {
  data: Either<GetRevisionsMetadataResponseBody, HttpErrorResponseBody>
}
