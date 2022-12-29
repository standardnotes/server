import { HttpErrorResponseBody, HttpResponse } from '@standardnotes/api'
import { Either } from '@standardnotes/common'

import { VerifyAuthenticatorAuthenticationResponseResponseBody } from './VerifyAuthenticatorAuthenticationResponseResponseBody'

export interface VerifyAuthenticatorAuthenticationResponseResponse extends HttpResponse {
  data: Either<VerifyAuthenticatorAuthenticationResponseResponseBody, HttpErrorResponseBody>
}
