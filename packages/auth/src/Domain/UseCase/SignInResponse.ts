import { HttpStatusCode } from '@standardnotes/responses'

import { AuthResponseCreationResult } from '../Auth/AuthResponseCreationResult'

export type SignInResponse =
  | {
      success: false
      errorMessage: string
      errorCode?: HttpStatusCode
    }
  | {
      success: true
      result: AuthResponseCreationResult
    }
