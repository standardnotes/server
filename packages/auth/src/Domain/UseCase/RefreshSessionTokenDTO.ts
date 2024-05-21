export type RefreshSessionTokenDTO = {
  authTokenFromHeaders: string
  refreshTokenFromHeaders: string
  apiVersion: string
  requestMetadata: {
    url: string
    method: string
    snjs?: string
    application?: string
    userAgent?: string
    secChUa?: string
  }
  authCookies?: Map<string, string[]>
}
