export interface CrossServiceTokenCacheInterface {
  set(dto: {
    authorizationHeaderValue: string
    encodedCrossServiceToken: string
    expiresAtInSeconds: number
    userUuid: string
  }): Promise<void>
  get(authorizationHeaderValue: string): Promise<string | null>
  invalidate(userUuid: string): Promise<void>
}
