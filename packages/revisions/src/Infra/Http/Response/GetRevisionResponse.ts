import { HttpErrorResponseBody, HttpResponse } from '@standardnotes/api'
import { Either } from '@standardnotes/common'

import { GetRevisionResponseBody } from './GetRevisionResponseBody'

export interface GetRevisionResponse extends HttpResponse {
  data: Either<GetRevisionResponseBody, HttpErrorResponseBody>
}
