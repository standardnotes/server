export interface SignInWithRecoveryCodesDTO {
  userAgent: string
  username: string
  password: string
  codeVerifier: string
  recoveryCodes: string
}
