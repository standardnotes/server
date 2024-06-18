import { KeyParamsData, SessionBody } from '@standardnotes/responses'

import { AuthResponse } from './AuthResponse'

export interface AuthResponse20200115 extends AuthResponse {
  sessionBody: SessionBody
  keyParams: KeyParamsData
}
