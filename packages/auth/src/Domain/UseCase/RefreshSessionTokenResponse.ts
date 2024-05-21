import { SessionCreationResult } from '../Session/SessionCreationResult'

export type RefreshSessionTokenResponse =
  | {
      success: true
      result: SessionCreationResult
      userUuid: string
    }
  | {
      success: false
      errorTag: string
      errorMessage: string
    }
