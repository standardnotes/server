export type SignInDTOV2Challenged = {
  apiVersion: string
  userAgent: string
  email: string
  password: string
  ephemeralSession: boolean
  codeVerifier: string
}
