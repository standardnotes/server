import { RegistrationResponseJSON } from '@simplewebauthn/typescript-types'

export interface VerifyAuthenticatorRegistrationResponseRequestParams {
  userUuid: string
  attestationResponse: RegistrationResponseJSON
}
