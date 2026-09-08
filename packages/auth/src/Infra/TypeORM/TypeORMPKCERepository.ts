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

  async storeCodeChallenge(codeChallenge: string, userUuid: string): Promise<void> {
    this.logger.debug(`Storing code challenge: ${codeChallenge}`)

    await this.cacheEntryRepository.save(
      CacheEntry.create({
        key: `${this.PREFIX}:${codeChallenge}`,
        value: userUuid,
        expiresAt: this.timer.getUTCDateNSecondsAhead(3600),
      }).getValue(),
    )
  }

  async removeCodeChallenge(codeChallenge: string, userUuid: string): Promise<boolean> {
    const key = `${this.PREFIX}:${codeChallenge}`
    const cacheEntry = await this.cacheEntryRepository.findUnexpiredOneByKey(key)

    // Legacy entries (pre user-uuid binding) stored value = codeChallenge; remove after 3600s TTL window.
    const storedValue = cacheEntry?.props.value
    if (!storedValue || (storedValue !== userUuid && storedValue !== codeChallenge)) {
      return false
    }

    await this.cacheEntryRepository.removeByKey(key)

    return true
  }
}
