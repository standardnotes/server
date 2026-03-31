import * as IORedis from 'ioredis'
import { inject, injectable } from 'inversify'

import TYPES from '../../Bootstrap/Types'
import { MfaSecretRepositoryInterface } from '../../Domain/Mfa/MfaSecretRepositoryInterface'

@injectable()
export class RedisMfaSecretRepository implements MfaSecretRepositoryInterface {
  private readonly PREFIX = 'mfa-secret'
  // 5 minutes
  private readonly DEFAULT_TTL = 300

  constructor(@inject(TYPES.Auth_Redis) private redisClient: IORedis.Redis) {}

  async getMfaSecret(userUuid: string): Promise<string | null> {
    const secret = await this.redisClient.get(`${this.PREFIX}:${userUuid}`)
    return secret
  }

  async setMfaSecret(userUuid: string, secret: string, ttlInSeconds: number = this.DEFAULT_TTL): Promise<void> {
    await this.redisClient.setex(`${this.PREFIX}:${userUuid}`, ttlInSeconds, secret)
  }

  async deleteMfaSecret(userUuid: string): Promise<void> {
    await this.redisClient.del(`${this.PREFIX}:${userUuid}`)
  }
}
