export interface VerifyAuthenticatorRegistrationResponseDTO {
  userUuid: string
  attestationResponse: Record<string, unknown>
}
