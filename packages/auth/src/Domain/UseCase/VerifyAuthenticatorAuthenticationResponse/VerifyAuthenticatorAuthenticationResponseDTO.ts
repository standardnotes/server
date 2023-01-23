export interface VerifyAuthenticatorAuthenticationResponseDTO {
  userUuid: string
  authenticatorResponse: Record<string, unknown>
}
