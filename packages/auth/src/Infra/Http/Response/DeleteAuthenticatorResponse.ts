import { HttpErrorResponseBody, HttpResponse } from '@standardnotes/api'
import { Either } from '@standardnotes/common'

import { DeleteAuthenticatorResponseBody } from './DeleteAuthenticatorResponseBody'

export interface DeleteAuthenticatorResponse extends HttpResponse {
  data: Either<DeleteAuthenticatorResponseBody, HttpErrorResponseBody>
}
