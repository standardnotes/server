import { Uuid } from '@standardnotes/domain-core'
import { SessionTokensCooldownRepositoryInterface } from '../../Domain/Session/SessionTokensCooldownRepositoryInterface'

export class InMemorySessionTokensCooldownRepository implements SessionTokensCooldownRepositoryInterface {
  private inMemoryStore: Map<string, string>
  private readonly COOLDOWN_FORMAT_VERSION = 1

  constructor() {
    this.inMemoryStore = new Map()
  }

  async getHashedTokens(sessionUuid: Uuid): Promise<{ hashedAccessToken: string; hashedRefreshToken: string } | null> {
    const result = this.inMemoryStore.get(sessionUuid.value)
    if (!result) {
      return null
    }

    const [version, hashedAccessToken, hashedRefreshToken] = result.split(':')

    if (parseInt(version) !== this.COOLDOWN_FORMAT_VERSION) {
      return null
    }

    return {
      hashedAccessToken,
      hashedRefreshToken,
    }
  }

  async setCooldown(dto: {
    sessionUuid: Uuid
    hashedAccessToken: string
    hashedRefreshToken: string
    cooldownPeriodInSeconds: number
  }): Promise<void> {
    this.inMemoryStore.set(
      dto.sessionUuid.value,
      `${this.COOLDOWN_FORMAT_VERSION}:${dto.hashedAccessToken}:${dto.hashedRefreshToken}`,
    )
  }
}
