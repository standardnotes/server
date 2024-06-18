export interface CookieFactoryInterface {
  createCookieHeaderValue(dto: {
    sessionUuid: string
    accessToken: string
    refreshToken: string
    refreshTokenExpiration: Date
  }): string[]
}
