import * as IORedis from 'ioredis'

import { TransitionStatusRepositoryInterface } from '../../Domain/Transition/TransitionStatusRepositoryInterface'

export class RedisTransitionStatusRepository implements TransitionStatusRepositoryInterface {
  private readonly PREFIX = 'transition'

  constructor(private redisClient: IORedis.Redis) {}

  async updateStatus(userUuid: string, status: 'STARTED' | 'FAILED'): Promise<void> {
    await this.redisClient.set(`${this.PREFIX}:${userUuid}`, status)
  }

  async removeStatus(userUuid: string): Promise<void> {
    await this.redisClient.del(`${this.PREFIX}:${userUuid}`)
  }

  async getStatus(userUuid: string): Promise<'STARTED' | 'FAILED' | null> {
    const status = (await this.redisClient.get(`${this.PREFIX}:${userUuid}`)) as 'STARTED' | 'FAILED' | null

    return status
  }
}
