import * as IORedis from 'ioredis'
import { inject, injectable } from 'inversify'
import TYPES from '../../Bootstrap/Types'
import { WebSocketsConnectionRepositoryInterface } from '../../Domain/WebSockets/WebSocketsConnectionRepositoryInterface'

@injectable()
export class RedisWebSocketsConnectionRepository implements WebSocketsConnectionRepositoryInterface {
  private readonly WEB_SOCKETS_USER_CONNECTIONS_PREFIX = 'ws_user_connections'
  private readonly WEB_SOCKETS_CONNETION_PREFIX = 'ws_connection'

  constructor(@inject(TYPES.Redis) private redisClient: IORedis.Redis) {}

  async findAllByUserUuid(userUuid: string): Promise<string[]> {
    return await this.redisClient.smembers(`${this.WEB_SOCKETS_USER_CONNECTIONS_PREFIX}:${userUuid}`)
  }

  async removeConnection(connectionId: string): Promise<void> {
    const userUuid = await this.redisClient.get(`${this.WEB_SOCKETS_CONNETION_PREFIX}:${connectionId}`)

    await this.redisClient.srem(`${this.WEB_SOCKETS_USER_CONNECTIONS_PREFIX}:${userUuid}`, connectionId)
    await this.redisClient.del(`${this.WEB_SOCKETS_CONNETION_PREFIX}:${connectionId}`)
  }

  async saveConnection(userUuid: string, connectionId: string): Promise<void> {
    await this.redisClient.set(`${this.WEB_SOCKETS_CONNETION_PREFIX}:${connectionId}`, userUuid)
    await this.redisClient.sadd(`${this.WEB_SOCKETS_USER_CONNECTIONS_PREFIX}:${userUuid}`, connectionId)
  }
}
