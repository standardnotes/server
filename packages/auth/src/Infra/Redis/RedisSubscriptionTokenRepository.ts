import * as IORedis from 'ioredis'
import { inject, injectable } from 'inversify'

import TYPES from '../../Bootstrap/Types'
import { SubscriptionToken } from '../../Domain/Subscription/SubscriptionToken'
import { SubscriptionTokenRepositoryInterface } from '../../Domain/Subscription/SubscriptionTokenRepositoryInterface'

@injectable()
export class RedisSubscriptionTokenRepository implements SubscriptionTokenRepositoryInterface {
  private readonly PREFIX = 'subscription-token'

  constructor(@inject(TYPES.Redis) private redisClient: IORedis.Redis) {}

  async getUserUuidByToken(token: string): Promise<string | undefined> {
    const userUuid = await this.redisClient.get(`${this.PREFIX}:${token}`)
    if (!userUuid) {
      return undefined
    }

    return userUuid
  }

  async save(subscriptionToken: SubscriptionToken): Promise<boolean> {
    const key = `${this.PREFIX}:${subscriptionToken.token}`

    const wasSet = await this.redisClient.set(key, subscriptionToken.userUuid)

    return wasSet === 'OK'
  }
}
