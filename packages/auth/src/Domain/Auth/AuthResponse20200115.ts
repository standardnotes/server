import { KeyParamsData, SessionBody } from '@standardnotes/responses'

import { AuthResponse } from './AuthResponse'

export interface AuthResponse20200115 extends AuthResponse {
  session: SessionBody
  key_params: KeyParamsData
}
