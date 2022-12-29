import { HttpErrorResponseBody, HttpResponse } from '@standardnotes/api'
import { Either } from '@standardnotes/common'

import { ListAuthenticatorsResponseBody } from './ListAuthenticatorsResponseBody'

export interface ListAuthenticatorsResponse extends HttpResponse {
  data: Either<ListAuthenticatorsResponseBody, HttpErrorResponseBody>
}
