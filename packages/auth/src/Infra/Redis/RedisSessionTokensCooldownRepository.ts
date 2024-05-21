import * as IORedis from 'ioredis'
import { Uuid } from '@standardnotes/domain-core'

import { SessionTokensCooldownRepositoryInterface } from '../../Domain/Session/SessionTokensCooldownRepositoryInterface'

export class RedisSessionTokensCooldownRepository implements SessionTokensCooldownRepositoryInterface {
  private readonly PREFIX = 'cooldown:session-tokens'
  private readonly COOLDOWN_FORMAT_VERSION = 1

  constructor(private redisClient: IORedis.Redis) {}

  async getHashedTokens(sessionUuid: Uuid): Promise<{ hashedAccessToken: string; hashedRefreshToken: string } | null> {
    const result = await this.redisClient.get(`${this.PREFIX}:${sessionUuid.value}`)
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
    await this.redisClient.setex(
      `${this.PREFIX}:${dto.sessionUuid.value}`,
      dto.cooldownPeriodInSeconds,
      `${this.COOLDOWN_FORMAT_VERSION}:${dto.hashedAccessToken}:${dto.hashedRefreshToken}`,
    )
  }
}
