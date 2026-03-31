import { CacheEntryRepositoryInterface, CacheEntry } from '@standardnotes/domain-core'
import { TimerInterface } from '@standardnotes/time'

import { MfaSecretRepositoryInterface } from '../../Domain/Mfa/MfaSecretRepositoryInterface'

export class TypeORMMfaSecretRepository implements MfaSecretRepositoryInterface {
  private readonly PREFIX = 'mfa-secret'
  // 5 minutes
  private readonly DEFAULT_TTL = 300

  constructor(
    private cacheEntryRepository: CacheEntryRepositoryInterface,
    private timer: TimerInterface,
  ) {}

  async getMfaSecret(userUuid: string): Promise<string | null> {
    const cacheEntry = await this.cacheEntryRepository.findUnexpiredOneByKey(`${this.PREFIX}:${userUuid}`)
    return cacheEntry ? cacheEntry.props.value : null
  }

  async setMfaSecret(userUuid: string, secret: string, ttlInSeconds: number = this.DEFAULT_TTL): Promise<void> {
    await this.cacheEntryRepository.save(
      CacheEntry.create({
        key: `${this.PREFIX}:${userUuid}`,
        value: secret,
        expiresAt: this.timer.getUTCDateNSecondsAhead(ttlInSeconds),
      }).getValue(),
    )
  }

  async deleteMfaSecret(userUuid: string): Promise<void> {
    await this.cacheEntryRepository.removeByKey(`${this.PREFIX}:${userUuid}`)
  }
}
