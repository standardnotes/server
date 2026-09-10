import { AuthResponseCreationResult } from '../../Auth/AuthResponseCreationResult'

export type SignInWithRecoveryCodesResponse =
  | {
      success: false
      errorMessage: string
      isNonCaptchaLimitReached?: boolean
    }
  | {
      success: true
      result: AuthResponseCreationResult
    }
