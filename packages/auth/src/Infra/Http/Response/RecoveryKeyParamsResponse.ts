import { HttpErrorResponseBody, HttpResponse } from '@standardnotes/api'
import { Either } from '@standardnotes/common'

import { RecoveryKeyParamsResponseBody } from './RecoveryKeyParamsResponseBody'

export interface RecoveryKeyParamsResponse extends HttpResponse {
  data: Either<RecoveryKeyParamsResponseBody, HttpErrorResponseBody>
}
