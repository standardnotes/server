export interface CrossServiceTokenCacheInterface {
  set(dto: {
    key: string
    encodedCrossServiceToken: string
    expiresAtInSeconds: number
    userUuid: string
  }): Promise<void>
  get(key: string): Promise<string | null>
  invalidate(userUuid: string): Promise<void>
}
