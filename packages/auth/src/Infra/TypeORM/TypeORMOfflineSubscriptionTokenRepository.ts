import { OfflineSubscriptionToken } from '../../Domain/Auth/OfflineSubscriptionToken'
import { OfflineSubscriptionTokenRepositoryInterface } from '../../Domain/Auth/OfflineSubscriptionTokenRepositoryInterface'
import { TimerInterface } from '@standardnotes/time'

import { CacheEntryRepositoryInterface } from '../../Domain/Cache/CacheEntryRepositoryInterface'
import { CacheEntry } from '../../Domain/Cache/CacheEntry'

export class TypeORMOfflineSubscriptionTokenRepository implements OfflineSubscriptionTokenRepositoryInterface {
  private readonly PREFIX = 'offline-subscription-token'

  constructor(private cacheEntryRepository: CacheEntryRepositoryInterface, private timer: TimerInterface) {}

  async getUserEmailByToken(token: string): Promise<string | undefined> {
    const userUuid = await this.cacheEntryRepository.findUnexpiredOneByKey(`${this.PREFIX}:${token}`)
    if (!userUuid) {
      return undefined
    }

    return userUuid.props.value
  }

  async save(offlineSubscriptionToken: OfflineSubscriptionToken): Promise<void> {
    const key = `${this.PREFIX}:${offlineSubscriptionToken.token}`

    await this.cacheEntryRepository.save(
      CacheEntry.create({
        key,
        value: offlineSubscriptionToken.userEmail,
        expiresAt: this.timer.convertMicrosecondsToDate(offlineSubscriptionToken.expiresAt),
      }).getValue(),
    )
  }
}
