import { HttpErrorResponseBody, HttpResponse } from '@standardnotes/api'
import { Either } from '@standardnotes/common'

import { GenerateRecoveryCodesResponseBody } from './GenerateRecoveryCodesResponseBody'

export interface GenerateRecoveryCodesResponse extends HttpResponse {
  data: Either<GenerateRecoveryCodesResponseBody, HttpErrorResponseBody>
}
