import { CacheEntryRepositoryInterface, CacheEntry } from '@standardnotes/domain-core'
import { TimerInterface } from '@standardnotes/time'

import { SubscriptionToken } from '../../Domain/Subscription/SubscriptionToken'
import { SubscriptionTokenRepositoryInterface } from '../../Domain/Subscription/SubscriptionTokenRepositoryInterface'

export class TypeORMSubscriptionTokenRepository implements SubscriptionTokenRepositoryInterface {
  private readonly PREFIX = 'subscription-token'

  constructor(
    private cacheEntryRepository: CacheEntryRepositoryInterface,
    private timer: TimerInterface,
  ) {}

  async getUserUuidByToken(token: string): Promise<string | undefined> {
    const userUuid = await this.cacheEntryRepository.findUnexpiredOneByKey(`${this.PREFIX}:${token}`)
    if (!userUuid) {
      return undefined
    }

    return userUuid.props.value
  }

  async save(subscriptionToken: SubscriptionToken): Promise<boolean> {
    const key = `${this.PREFIX}:${subscriptionToken.token}`

    await this.cacheEntryRepository.save(
      CacheEntry.create({
        key,
        value: subscriptionToken.userUuid,
        expiresAt: this.timer.convertMicrosecondsToDate(subscriptionToken.expiresAt),
      }).getValue(),
    )

    return true
  }
}
