import { RegistrationResponseJSON } from '@simplewebauthn/typescript-types'
export interface VerifyAuthenticatorRegistrationResponseDTO {
  userUuid: string
  attestationResponse: RegistrationResponseJSON
}
