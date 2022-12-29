import { HttpErrorResponseBody, HttpResponse } from '@standardnotes/api'
import { Either } from '@standardnotes/common'

import { GenerateAuthenticatorRegistrationOptionsResponseBody } from './GenerateAuthenticatorRegistrationOptionsResponseBody'

export interface GenerateAuthenticatorRegistrationOptionsResponse extends HttpResponse {
  data: Either<GenerateAuthenticatorRegistrationOptionsResponseBody, HttpErrorResponseBody>
}
