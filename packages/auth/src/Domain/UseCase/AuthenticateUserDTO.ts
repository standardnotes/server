export type AuthenticateUserDTO = {
  authTokenFromHeaders: string
  authCookies?: Map<string, string[]>
  requestMetadata: {
    url: string
    method: string
    snjs?: string
    application?: string
    userAgent?: string
    secChUa?: string
  }
}
