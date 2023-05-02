import { CacheEntry, CacheEntryRepositoryInterface } from '@standardnotes/domain-core'
import { TimerInterface } from '@standardnotes/time'
import { Logger } from 'winston'

import { PKCERepositoryInterface } from '../../Domain/User/PKCERepositoryInterface'

export class TypeORMPKCERepository implements PKCERepositoryInterface {
  private readonly PREFIX = 'pkce'

  constructor(
    private cacheEntryRepository: CacheEntryRepositoryInterface,
    private logger: Logger,
    private timer: TimerInterface,
  ) {}

  async storeCodeChallenge(codeChallenge: string): Promise<void> {
    this.logger.debug(`Storing code challenge: ${codeChallenge}`)

    await this.cacheEntryRepository.save(
      CacheEntry.create({
        key: `${this.PREFIX}:${codeChallenge}`,
        value: codeChallenge,
        expiresAt: this.timer.getUTCDateNSecondsAhead(3600),
      }).getValue(),
    )
  }

  async removeCodeChallenge(codeChallenge: string): Promise<boolean> {
    await this.cacheEntryRepository.removeByKey(`${this.PREFIX}:${codeChallenge}`)

    return true
  }
}
