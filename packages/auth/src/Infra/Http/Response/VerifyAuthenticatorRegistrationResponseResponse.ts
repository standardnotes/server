import { HttpErrorResponseBody, HttpResponse } from '@standardnotes/api'
import { Either } from '@standardnotes/common'

import { VerifyAuthenticatorRegistrationResponseResponseBody } from './VerifyAuthenticatorRegistrationResponseResponseBody'

export interface VerifyAuthenticatorRegistrationResponseResponse extends HttpResponse {
  data: Either<VerifyAuthenticatorRegistrationResponseResponseBody, HttpErrorResponseBody>
}
