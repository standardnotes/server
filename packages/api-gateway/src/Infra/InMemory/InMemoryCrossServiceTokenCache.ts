import { TimerInterface } from '@standardnotes/time'

import { CrossServiceTokenCacheInterface } from '../../Service/Cache/CrossServiceTokenCacheInterface'

export class InMemoryCrossServiceTokenCache implements CrossServiceTokenCacheInterface {
  private readonly PREFIX = 'cst'
  private readonly USER_CST_PREFIX = 'user-cst'

  private crossServiceTokenCache: Map<string, string> = new Map()
  private crossServiceTokenTTLCache: Map<string, number> = new Map()

  constructor(private timer: TimerInterface) {}

  async set(dto: {
    key: string
    encodedCrossServiceToken: string
    expiresAtInSeconds: number
    userUuid: string
  }): Promise<void> {
    let userKeys = []
    const userKeysJSON = this.crossServiceTokenCache.get(`${this.USER_CST_PREFIX}:${dto.userUuid}`)
    if (userKeysJSON) {
      userKeys = JSON.parse(userKeysJSON)
    }
    userKeys.push(dto.key)

    this.crossServiceTokenCache.set(`${this.USER_CST_PREFIX}:${dto.userUuid}`, JSON.stringify(userKeys))
    this.crossServiceTokenTTLCache.set(`${this.USER_CST_PREFIX}:${dto.userUuid}`, dto.expiresAtInSeconds)

    this.crossServiceTokenCache.set(`${this.PREFIX}:${dto.key}`, dto.encodedCrossServiceToken)
    this.crossServiceTokenTTLCache.set(`${this.PREFIX}:${dto.key}`, dto.expiresAtInSeconds)
  }

  async get(key: string): Promise<string | null> {
    this.invalidateExpiredTokens()

    const cachedToken = this.crossServiceTokenCache.get(`${this.PREFIX}:${key}`)
    if (!cachedToken) {
      return null
    }

    return cachedToken
  }

  async invalidate(userUuid: string): Promise<void> {
    let userKeyValues = []
    const userKeysJSON = this.crossServiceTokenCache.get(`${this.USER_CST_PREFIX}:${userUuid}`)
    if (userKeysJSON) {
      userKeyValues = JSON.parse(userKeysJSON)
    }

    for (const key of userKeyValues) {
      this.crossServiceTokenCache.delete(`${this.PREFIX}:${key}`)
      this.crossServiceTokenTTLCache.delete(`${this.PREFIX}:${key}`)
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
