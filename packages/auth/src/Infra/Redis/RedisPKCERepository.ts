import * as IORedis from 'ioredis'
import { inject, injectable } from 'inversify'
import { Logger } from 'winston'

import TYPES from '../../Bootstrap/Types'
import { PKCERepositoryInterface } from '../../Domain/User/PKCERepositoryInterface'

@injectable()
export class RedisPKCERepository implements PKCERepositoryInterface {
  private readonly PREFIX = 'pkce'

  constructor(
    @inject(TYPES.Auth_Redis) private redisClient: IORedis.Redis,
    @inject(TYPES.Auth_Logger) private logger: Logger,
  ) {}

  async storeCodeChallenge(codeChallenge: string, userUuid: string): Promise<void> {
    this.logger.debug(`Storing code challenge: ${codeChallenge}`)

    await this.redisClient.setex(`${this.PREFIX}:${codeChallenge}`, 3600, userUuid)
  }

  async removeCodeChallenge(codeChallenge: string, userUuid: string): Promise<boolean> {
    const key = `${this.PREFIX}:${codeChallenge}`
    const storedUserUuid = await this.redisClient.get(key)

    // Legacy entries (pre user-uuid binding) stored value = codeChallenge; remove after 3600s TTL window.
    if (!storedUserUuid || (storedUserUuid !== userUuid && storedUserUuid !== codeChallenge)) {
      return false
    }

    const entriesRemoved = await this.redisClient.del(key)

    this.logger.debug(`Removed ${entriesRemoved} entries for code challenge: ${codeChallenge}`)

    return entriesRemoved === 1
  }
}
