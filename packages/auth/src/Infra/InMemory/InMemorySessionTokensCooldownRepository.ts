import { Uuid } from '@standardnotes/domain-core'
import { Logger } from 'winston'
import { SessionTokensCooldownRepositoryInterface } from '../../Domain/Session/SessionTokensCooldownRepositoryInterface'

export class InMemorySessionTokensCooldownRepository implements SessionTokensCooldownRepositoryInterface {
  constructor(private logger: Logger) {}

  async getHashedTokens(_sessionUuid: Uuid): Promise<{ hashedAccessToken: string; hashedRefreshToken: string } | null> {
    this.logger.debug('This is a stub. Session tokens cooldown is suppored only in Redis.')

    return null
  }

  async setCooldown(_dto: {
    sessionUuid: Uuid
    hashedAccessToken: string
    hashedRefreshToken: string
    cooldownPeriodInSeconds: number
  }): Promise<void> {
    this.logger.debug('This is a stub. Session tokens cooldown is suppored only in Redis.')
  }
}
