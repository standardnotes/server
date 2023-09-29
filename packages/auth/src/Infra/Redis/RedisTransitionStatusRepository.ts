import * as IORedis from 'ioredis'

import { TransitionStatusRepositoryInterface } from '../../Domain/Transition/TransitionStatusRepositoryInterface'
import { TransitionStatus } from '@standardnotes/domain-core'

export class RedisTransitionStatusRepository implements TransitionStatusRepositoryInterface {
  private readonly PREFIX = 'transition'

  constructor(private redisClient: IORedis.Redis) {}

  async remove(userUuid: string, transitionType: 'items' | 'revisions'): Promise<void> {
    await this.redisClient.del(`${this.PREFIX}:${transitionType}:${userUuid}`)
  }

  async updateStatus(userUuid: string, transitionType: 'items' | 'revisions', status: TransitionStatus): Promise<void> {
    switch (status.value) {
      case TransitionStatus.STATUSES.Failed:
      case TransitionStatus.STATUSES.Verified:
        await this.redisClient.set(`${this.PREFIX}:${transitionType}:${userUuid}`, status.value)
        break
      case TransitionStatus.STATUSES.InProgress: {
        const ttl24Hours = 86_400
        await this.redisClient.setex(`${this.PREFIX}:${transitionType}:${userUuid}`, ttl24Hours, status.value)
        break
      }
    }
  }

  async getStatus(userUuid: string, transitionType: 'items' | 'revisions'): Promise<TransitionStatus | null> {
    const status = await this.redisClient.get(`${this.PREFIX}:${transitionType}:${userUuid}`)

    if (status === null) {
      return null
    }

    const transitionStatusOrError = TransitionStatus.create(status)
    if (transitionStatusOrError.isFailed()) {
      return null
    }

    return transitionStatusOrError.getValue()
  }
}
