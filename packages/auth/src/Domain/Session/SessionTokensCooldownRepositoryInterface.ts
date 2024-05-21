import { Uuid } from '@standardnotes/domain-core'

export interface SessionTokensCooldownRepositoryInterface {
  setCooldown(dto: {
    sessionUuid: Uuid
    hashedAccessToken: string
    hashedRefreshToken: string
    cooldownPeriodInSeconds: number
  }): Promise<void>
  getHashedTokens(sessionUuid: Uuid): Promise<{
    hashedAccessToken: string
    hashedRefreshToken: string
  } | null>
}
