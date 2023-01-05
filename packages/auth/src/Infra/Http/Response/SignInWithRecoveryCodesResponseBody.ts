import { KeyParamsData, SessionBody } from '@standardnotes/responses'

export interface SignInWithRecoveryCodesResponseBody {
  session: SessionBody
  key_params: KeyParamsData
}
