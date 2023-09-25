import * as IORedis from 'ioredis'

import { TransitionRepositoryInterface } from '../../Domain/Transition/TransitionRepositoryInterface'

export class RedisTransitionRepository implements TransitionRepositoryInterface {
  private readonly PREFIX = 'transition-revisions-paging-progress'

  constructor(private redisClient: IORedis.Redis) {}

  async getPagingProgress(userUuid: string): Promise<number> {
    const progress = await this.redisClient.get(`${this.PREFIX}:${userUuid}`)

    if (progress === null) {
      return 1
    }

    return parseInt(progress)
  }

  async setPagingProgress(userUuid: string, progress: number): Promise<void> {
    await this.redisClient.setex(`${this.PREFIX}:${userUuid}`, 172_800, progress.toString())
  }
}
