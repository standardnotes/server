import { HttpStatusCode } from '@standardnotes/responses'

import { AuthResponseCreationResult } from '../Auth/AuthResponseCreationResult'

export type SignInResponse =
  | {
      success: false
      errorMessage: string
      errorCode?: HttpStatusCode
      isNonCaptchaLimitReached?: boolean
    }
  | {
      success: true
      result: AuthResponseCreationResult
    }
