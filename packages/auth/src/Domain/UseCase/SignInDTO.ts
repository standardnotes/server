export type SignInDTO = {
  apiVersion: string
  userAgent: string
  email: string
  password: string
  ephemeralSession: boolean
  codeVerifier: string
  hvmToken?: string
  snjs?: string
  application?: string
}
