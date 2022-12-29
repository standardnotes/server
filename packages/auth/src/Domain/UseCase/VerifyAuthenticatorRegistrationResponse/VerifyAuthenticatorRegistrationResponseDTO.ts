export interface VerifyAuthenticatorRegistrationResponseDTO {
  userUuid: string
  name: string
  registrationCredential: Record<string, unknown>
}
