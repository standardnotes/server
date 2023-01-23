export interface VerifyAuthenticatorRegistrationResponseDTO {
  userUuid: string
  name: string
  attestationResponse: Record<string, unknown>
}
