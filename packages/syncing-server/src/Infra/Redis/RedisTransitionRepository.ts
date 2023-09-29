import * as IORedis from 'ioredis'

import { TransitionRepositoryInterface } from '../../Domain/Transition/TransitionRepositoryInterface'

export class RedisTransitionRepository implements TransitionRepositoryInterface {
  private readonly PREFIX = 'transition-items-migration-progress'
  private readonly INTEGRITY_PREFIX = 'transition-items-integrity-progress'

  constructor(private redisClient: IORedis.Redis) {}

  async getIntegrityProgress(userUuid: string): Promise<number> {
    const progress = await this.redisClient.get(`${this.INTEGRITY_PREFIX}:${userUuid}`)

    if (progress === null) {
      return 1
    }

    return parseInt(progress)
  }

  async setIntegrityProgress(userUuid: string, progress: number): Promise<void> {
    await this.redisClient.setex(`${this.INTEGRITY_PREFIX}:${userUuid}`, 172_800, progress.toString())
  }

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
