export interface VerifyAuthenticatorRegistrationResponseDTO {
  userUuid: string
  challenge: Buffer
  registrationCredential: Record<string, unknown>
}
