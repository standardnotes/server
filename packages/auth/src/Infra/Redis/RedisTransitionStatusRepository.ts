import * as IORedis from 'ioredis'

import { TransitionStatusRepositoryInterface } from '../../Domain/Transition/TransitionStatusRepositoryInterface'

export class RedisTransitionStatusRepository implements TransitionStatusRepositoryInterface {
  private readonly PREFIX = 'transition'

  constructor(private redisClient: IORedis.Redis) {}

  async getStatuses(
    transitionType: 'items' | 'revisions',
  ): Promise<{ userUuid: string; status: 'STARTED' | 'IN_PROGRESS' | 'FAILED' }[]> {
    const keys = await this.redisClient.keys(`${this.PREFIX}:${transitionType}:*`)
    const statuses = await Promise.all(
      keys.map(async (key) => {
        const userUuid = key.split(':')[2]
        const status = (await this.redisClient.get(key)) as 'STARTED' | 'IN_PROGRESS' | 'FAILED'
        return { userUuid, status }
      }),
    )

    return statuses
  }

  async updateStatus(
    userUuid: string,
    transitionType: 'items' | 'revisions',
    status: 'STARTED' | 'IN_PROGRESS' | 'FAILED',
  ): Promise<void> {
    if (status === 'IN_PROGRESS') {
      await this.redisClient.setex(`${this.PREFIX}:${transitionType}:${userUuid}`, 7200, status)
    } else {
      await this.redisClient.set(`${this.PREFIX}:${transitionType}:${userUuid}`, status)
    }
  }

  async removeStatus(userUuid: string, transitionType: 'items' | 'revisions'): Promise<void> {
    await this.redisClient.del(`${this.PREFIX}:${transitionType}:${userUuid}`)
  }

  async getStatus(
    userUuid: string,
    transitionType: 'items' | 'revisions',
  ): Promise<'STARTED' | 'IN_PROGRESS' | 'FAILED' | null> {
    const status = (await this.redisClient.get(`${this.PREFIX}:${transitionType}:${userUuid}`)) as
      | 'STARTED'
      | 'IN_PROGRESS'
      | 'FAILED'
      | null

    return status
  }
}
