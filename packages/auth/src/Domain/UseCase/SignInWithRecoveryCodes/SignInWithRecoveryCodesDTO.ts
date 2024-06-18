export interface SignInWithRecoveryCodesDTO {
  apiVersion: string
  userAgent: string
  username: string
  password: string
  codeVerifier: string
  recoveryCodes: string
  hvmToken?: string
  snjs?: string
  application?: string
}
