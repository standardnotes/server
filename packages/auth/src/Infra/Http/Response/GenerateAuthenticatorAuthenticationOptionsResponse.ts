import { HttpErrorResponseBody, HttpResponse } from '@standardnotes/api'
import { Either } from '@standardnotes/common'

import { GenerateAuthenticatorAuthenticationOptionsResponseBody } from './GenerateAuthenticatorAuthenticationOptionsResponseBody'

export interface GenerateAuthenticatorAuthenticationOptionsResponse extends HttpResponse {
  data: Either<GenerateAuthenticatorAuthenticationOptionsResponseBody, HttpErrorResponseBody>
}
