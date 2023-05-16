import * as IORedis from 'ioredis'
import { inject, injectable } from 'inversify'

import TYPES from '../../Bootstrap/Types'
import { SubscriptionToken } from '../../Domain/Subscription/SubscriptionToken'
import { SubscriptionTokenRepositoryInterface } from '../../Domain/Subscription/SubscriptionTokenRepositoryInterface'
import { TimerInterface } from '@standardnotes/time'

@injectable()
export class RedisSubscriptionTokenRepository implements SubscriptionTokenRepositoryInterface {
  private readonly PREFIX = 'subscription-token'

  constructor(
    @inject(TYPES.Auth_Redis) private redisClient: IORedis.Redis,
    @inject(TYPES.Auth_Timer) private timer: TimerInterface,
  ) {}

  async getUserUuidByToken(token: string): Promise<string | undefined> {
    const userUuid = await this.redisClient.get(`${this.PREFIX}:${token}`)
    if (!userUuid) {
      return undefined
    }

    return userUuid
  }

  async save(subscriptionToken: SubscriptionToken): Promise<boolean> {
    const key = `${this.PREFIX}:${subscriptionToken.token}`
    const expiresAtTimestampInSeconds = this.timer.convertMicrosecondsToSeconds(subscriptionToken.expiresAt)

    const wasSet = await this.redisClient.set(key, subscriptionToken.userUuid)
    const timeoutWasSet = await this.redisClient.expireat(key, expiresAtTimestampInSeconds)

    return wasSet === 'OK' && timeoutWasSet !== 0
  }
}
