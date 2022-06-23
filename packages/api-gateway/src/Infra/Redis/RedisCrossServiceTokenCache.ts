import { inject, injectable } from 'inversify'
import * as IORedis from 'ioredis'
import TYPES from '../../Bootstrap/Types'

import { CrossServiceTokenCacheInterface } from '../../Service/Cache/CrossServiceTokenCacheInterface'

@injectable()
export class RedisCrossServiceTokenCache implements CrossServiceTokenCacheInterface {
  private readonly PREFIX = 'cst'
  private readonly USER_CST_PREFIX = 'user-cst'

  constructor(@inject(TYPES.Redis) private redisClient: IORedis.Redis) {}

  async set(dto: {
    authorizationHeaderValue: string
    encodedCrossServiceToken: string
    expiresAtInSeconds: number
    userUuid: string
  }): Promise<void> {
    const pipeline = this.redisClient.pipeline()

    pipeline.sadd(`${this.USER_CST_PREFIX}:${dto.userUuid}`, dto.authorizationHeaderValue)
    pipeline.expireat(`${this.USER_CST_PREFIX}:${dto.userUuid}`, dto.expiresAtInSeconds)

    pipeline.set(`${this.PREFIX}:${dto.authorizationHeaderValue}`, dto.encodedCrossServiceToken)
    pipeline.expireat(`${this.PREFIX}:${dto.authorizationHeaderValue}`, dto.expiresAtInSeconds)

    await pipeline.exec()
  }

  async get(authorizationHeaderValue: string): Promise<string | null> {
    return this.redisClient.get(`${this.PREFIX}:${authorizationHeaderValue}`)
  }

  async invalidate(userUuid: string): Promise<void> {
    const userAuthorizationHeaderValues = await this.redisClient.smembers(`${this.USER_CST_PREFIX}:${userUuid}`)

    const pipeline = this.redisClient.pipeline()
    for (const authorizationHeaderValue of userAuthorizationHeaderValues) {
      pipeline.del(`${this.PREFIX}:${authorizationHeaderValue}`)
    }
    pipeline.del(`${this.USER_CST_PREFIX}:${userUuid}`)

    await pipeline.exec()
  }
}
