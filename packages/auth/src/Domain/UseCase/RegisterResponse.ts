import { AuthResponse20200115 } from '../Auth/AuthResponse20200115'

export type RegisterResponse =
  | {
      success: true
      authResponse: AuthResponse20200115
    }
  | {
      success: false
      errorMessage: string
    }
