import { TimerInterface } from '@standardnotes/time'

import { CrossServiceTokenCacheInterface } from '../../Service/Cache/CrossServiceTokenCacheInterface'

export class InMemoryCrossServiceTokenCache implements CrossServiceTokenCacheInterface {
  private readonly PREFIX = 'cst'
  private readonly USER_CST_PREFIX = 'user-cst'

  private crossServiceTokenCache: Map<string, string> = new Map()
  private crossServiceTokenTTLCache: Map<string, number> = new Map()

  constructor(private timer: TimerInterface) {}

  async set(dto: {
    authorizationHeaderValue: string
    encodedCrossServiceToken: string
    expiresAtInSeconds: number
    userUuid: string
  }): Promise<void> {
    let userAuthHeaders = []
    const userAuthHeadersJSON = this.crossServiceTokenCache.get(`${this.USER_CST_PREFIX}:${dto.userUuid}`)
    if (userAuthHeadersJSON) {
      userAuthHeaders = JSON.parse(userAuthHeadersJSON)
    }
    userAuthHeaders.push(dto.authorizationHeaderValue)

    this.crossServiceTokenCache.set(`${this.USER_CST_PREFIX}:${dto.userUuid}`, JSON.stringify(userAuthHeaders))
    this.crossServiceTokenTTLCache.set(`${this.USER_CST_PREFIX}:${dto.userUuid}`, dto.expiresAtInSeconds)

    this.crossServiceTokenCache.set(`${this.PREFIX}:${dto.authorizationHeaderValue}`, dto.encodedCrossServiceToken)
    this.crossServiceTokenTTLCache.set(`${this.PREFIX}:${dto.authorizationHeaderValue}`, dto.expiresAtInSeconds)
  }

  async get(authorizationHeaderValue: string): Promise<string | null> {
    this.invalidateExpiredTokens()

    const cachedToken = this.crossServiceTokenCache.get(`${this.PREFIX}:${authorizationHeaderValue}`)
    if (!cachedToken) {
      return null
    }

    return cachedToken
  }

  async invalidate(userUuid: string): Promise<void> {
    let userAuthorizationHeaderValues = []
    const userAuthHeadersJSON = this.crossServiceTokenCache.get(`${this.USER_CST_PREFIX}:${userUuid}`)
    if (userAuthHeadersJSON) {
      userAuthorizationHeaderValues = JSON.parse(userAuthHeadersJSON)
    }

    for (const authorizationHeaderValue of userAuthorizationHeaderValues) {
      this.crossServiceTokenCache.delete(`${this.PREFIX}:${authorizationHeaderValue}`)
      this.crossServiceTokenTTLCache.delete(`${this.PREFIX}:${authorizationHeaderValue}`)
    }
    this.crossServiceTokenCache.delete(`${this.USER_CST_PREFIX}:${userUuid}`)
    this.crossServiceTokenTTLCache.delete(`${this.USER_CST_PREFIX}:${userUuid}`)
  }

  private invalidateExpiredTokens(): void {
    const nowInSeconds = this.timer.getTimestampInSeconds()
    for (const [key, expiresAtInSeconds] of this.crossServiceTokenTTLCache.entries()) {
      if (expiresAtInSeconds <= nowInSeconds) {
        this.crossServiceTokenCache.delete(key)
        this.crossServiceTokenTTLCache.delete(key)
      }
    }
  }
}
