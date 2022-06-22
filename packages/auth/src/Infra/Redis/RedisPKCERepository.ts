import * as IORedis from 'ioredis'
import { inject, injectable } from 'inversify'
import { Logger } from 'winston'

import TYPES from '../../Bootstrap/Types'
import { PKCERepositoryInterface } from '../../Domain/User/PKCERepositoryInterface'

@injectable()
export class RedisPKCERepository implements PKCERepositoryInterface {
  private readonly PREFIX = 'pkce'

  constructor(@inject(TYPES.Redis) private redisClient: IORedis.Redis, @inject(TYPES.Logger) private logger: Logger) {}

  async storeCodeChallenge(codeChallenge: string): Promise<void> {
    this.logger.debug(`Storing code challenge: ${codeChallenge}`)

    await this.redisClient.setex(`${this.PREFIX}:${codeChallenge}`, 3600, codeChallenge)
  }

  async removeCodeChallenge(codeChallenge: string): Promise<boolean> {
    const entriesRemoved = await this.redisClient.del(`${this.PREFIX}:${codeChallenge}`)

    this.logger.debug(`Removed ${entriesRemoved} entries for code challenge: ${codeChallenge}`)

    return entriesRemoved === 1
  }
}
