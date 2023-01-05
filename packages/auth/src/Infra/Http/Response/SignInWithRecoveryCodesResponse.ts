import { HttpErrorResponseBody, HttpResponse } from '@standardnotes/api'
import { Either } from '@standardnotes/common'

import { SignInWithRecoveryCodesResponseBody } from './SignInWithRecoveryCodesResponseBody'

export interface SignInWithRecoveryCodesResponse extends HttpResponse {
  data: Either<SignInWithRecoveryCodesResponseBody, HttpErrorResponseBody>
}
