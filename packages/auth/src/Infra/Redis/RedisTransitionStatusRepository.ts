import * as IORedis from 'ioredis'

import { TransitionStatusRepositoryInterface } from '../../Domain/Transition/TransitionStatusRepositoryInterface'

export class RedisTransitionStatusRepository implements TransitionStatusRepositoryInterface {
  private readonly PREFIX = 'transition'

  constructor(private redisClient: IORedis.Redis) {}

  async updateStatus(
    userUuid: string,
    transitionType: 'items' | 'revisions',
    status: 'STARTED' | 'IN_PROGRESS' | 'FINISHED' | 'FAILED' | 'VERIFIED',
  ): Promise<void> {
    switch (status) {
      case 'FAILED':
      case 'VERIFIED':
        await this.redisClient.set(`${this.PREFIX}:${transitionType}:${userUuid}`, status)
        break
      case 'IN_PROGRESS': {
        const ttl2Hourse = 7_200
        await this.redisClient.setex(`${this.PREFIX}:${transitionType}:${userUuid}`, ttl2Hourse, status)
        break
      }
      default: {
        const ttl10Hours = 36_000
        await this.redisClient.setex(`${this.PREFIX}:${transitionType}:${userUuid}`, ttl10Hours, status)
        break
      }
    }
  }

  async getStatus(
    userUuid: string,
    transitionType: 'items' | 'revisions',
  ): Promise<'STARTED' | 'IN_PROGRESS' | 'FINISHED' | 'FAILED' | 'VERIFIED' | null> {
    const status = await this.redisClient.get(`${this.PREFIX}:${transitionType}:${userUuid}`)

    return status as 'STARTED' | 'IN_PROGRESS' | 'FINISHED' | 'FAILED' | 'VERIFIED' | null
  }
}
