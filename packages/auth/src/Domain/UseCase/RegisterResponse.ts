import { AuthResponseCreationResult } from '../Auth/AuthResponseCreationResult'

export type RegisterResponse =
  | {
      success: true
      result: AuthResponseCreationResult
    }
  | {
      success: false
      errorMessage: string
    }
