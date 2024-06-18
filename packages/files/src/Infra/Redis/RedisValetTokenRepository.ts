import * as IORedis from 'ioredis'

import { ValetTokenRepositoryInterface } from '../../Domain/ValetToken/ValetTokenRepositoryInterface'

export class RedisValetTokenRepository implements ValetTokenRepositoryInterface {
  private readonly VALET_TOKEN_PREFIX = 'vt'

  constructor(private redisClient: IORedis.Redis) {}

  async markAsUsed(valetToken: string): Promise<void> {
    const dayInSeconds = 60 * 60 * 24

    await this.redisClient.setex(`${this.VALET_TOKEN_PREFIX}:${valetToken}`, dayInSeconds, 'used')
  }

  async isUsed(valetToken: string): Promise<boolean> {
    return (await this.redisClient.get(`${this.VALET_TOKEN_PREFIX}:${valetToken}`)) === 'used'
  }
}
