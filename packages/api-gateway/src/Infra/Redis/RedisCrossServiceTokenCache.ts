import { inject, injectable } from 'inversify'
import * as IORedis from 'ioredis'
import { TYPES } from '../../Bootstrap/Types'

import { CrossServiceTokenCacheInterface } from '../../Service/Cache/CrossServiceTokenCacheInterface'

@injectable()
export class RedisCrossServiceTokenCache implements CrossServiceTokenCacheInterface {
  private readonly PREFIX = 'cst'
  private readonly USER_CST_PREFIX = 'user-cst'

  constructor(@inject(TYPES.ApiGateway_Redis) private redisClient: IORedis.Redis) {}

  async set(dto: {
    key: string
    encodedCrossServiceToken: string
    expiresAtInSeconds: number
    userUuid: string
  }): Promise<void> {
    const pipeline = this.redisClient.pipeline()

    pipeline.sadd(`${this.USER_CST_PREFIX}:${dto.userUuid}`, dto.key)
    pipeline.expireat(`${this.USER_CST_PREFIX}:${dto.userUuid}`, dto.expiresAtInSeconds)

    pipeline.set(`${this.PREFIX}:${dto.key}`, dto.encodedCrossServiceToken)
    pipeline.expireat(`${this.PREFIX}:${dto.key}`, dto.expiresAtInSeconds)

    await pipeline.exec()
  }

  async get(key: string): Promise<string | null> {
    return this.redisClient.get(`${this.PREFIX}:${key}`)
  }

  async invalidate(userUuid: string): Promise<void> {
    const userKeyValues = await this.redisClient.smembers(`${this.USER_CST_PREFIX}:${userUuid}`)

    const pipeline = this.redisClient.pipeline()
    for (const key of userKeyValues) {
      pipeline.del(`${this.PREFIX}:${key}`)
    }
    pipeline.del(`${this.USER_CST_PREFIX}:${userUuid}`)

    await pipeline.exec()
  }
}
