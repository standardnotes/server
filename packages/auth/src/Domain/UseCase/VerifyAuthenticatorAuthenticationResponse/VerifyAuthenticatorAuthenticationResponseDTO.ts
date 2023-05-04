import { AuthenticationResponseJSON } from '@simplewebauthn/typescript-types'

export interface VerifyAuthenticatorAuthenticationResponseDTO {
  userUuid: string
  authenticatorResponse: AuthenticationResponseJSON
}
