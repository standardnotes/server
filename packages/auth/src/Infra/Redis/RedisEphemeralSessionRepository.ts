import * as IORedis from 'ioredis'

import { inject, injectable } from 'inversify'
import TYPES from '../../Bootstrap/Types'
import { EphemeralSession } from '../../Domain/Session/EphemeralSession'
import { EphemeralSessionRepositoryInterface } from '../../Domain/Session/EphemeralSessionRepositoryInterface'

@injectable()
export class RedisEphemeralSessionRepository implements EphemeralSessionRepositoryInterface {
  private readonly PREFIX = 'session'
  private readonly PREFIX_PRIVATE_ID = 'session-private-id'
  private readonly USER_SESSIONS_PREFIX = 'user-sessions'

  constructor(
    @inject(TYPES.Auth_Redis) private redisClient: IORedis.Redis,
    @inject(TYPES.Auth_EPHEMERAL_SESSION_AGE) private ephemeralSessionAge: number,
  ) {}

  async findOneByPrivateIdentifier(privateIdentifier: string): Promise<EphemeralSession | null> {
    const stringifiedSession = await this.redisClient.get(`${this.PREFIX_PRIVATE_ID}:${privateIdentifier}`)
    if (!stringifiedSession) {
      return null
    }

    return JSON.parse(stringifiedSession)
  }

  async deleteOne(uuid: string, userUuid: string): Promise<void> {
    const pipeline = this.redisClient.pipeline()

    pipeline.del(`${this.PREFIX}:${uuid}`)
    pipeline.del(`${this.PREFIX}:${uuid}:${userUuid}`)
    pipeline.srem(`${this.USER_SESSIONS_PREFIX}:${userUuid}`, uuid)

    await pipeline.exec()
  }

  async updateTokensAndExpirationDates(
    uuid: string,
    hashedAccessToken: string,
    hashedRefreshToken: string,
    accessExpiration: Date,
    refreshExpiration: Date,
  ): Promise<void> {
    const session = await this.findOneByUuid(uuid)
    if (!session) {
      return
    }

    session.hashedAccessToken = hashedAccessToken
    session.hashedRefreshToken = hashedRefreshToken
    session.accessExpiration = accessExpiration
    session.refreshExpiration = refreshExpiration

    await this.update(session)
  }

  async findAllByUserUuid(userUuid: string): Promise<Array<EphemeralSession>> {
    const ephemeralSessionUuids = await this.redisClient.smembers(`${this.USER_SESSIONS_PREFIX}:${userUuid}`)

    const sessions = []
    for (const ephemeralSessionUuid of ephemeralSessionUuids) {
      const stringifiedSession = await this.redisClient.get(`${this.PREFIX}:${ephemeralSessionUuid}`)
      if (stringifiedSession !== null) {
        sessions.push(JSON.parse(stringifiedSession))
      }
    }

    return sessions
  }

  async findOneByUuid(uuid: string): Promise<EphemeralSession | null> {
    const stringifiedSession = await this.redisClient.get(`${this.PREFIX}:${uuid}`)
    if (!stringifiedSession) {
      return null
    }

    return JSON.parse(stringifiedSession)
  }

  async findOneByUuidAndUserUuid(uuid: string, userUuid: string): Promise<EphemeralSession | null> {
    const stringifiedSession = await this.redisClient.get(`${this.PREFIX}:${uuid}:${userUuid}`)
    if (!stringifiedSession) {
      return null
    }

    return JSON.parse(stringifiedSession)
  }

  async insert(ephemeralSession: EphemeralSession): Promise<void> {
    const ttl = this.ephemeralSessionAge

    const stringifiedSession = JSON.stringify(ephemeralSession)

    const pipeline = this.redisClient.pipeline()

    pipeline.setex(`${this.PREFIX}:${ephemeralSession.uuid}:${ephemeralSession.userUuid}`, ttl, stringifiedSession)
    pipeline.setex(`${this.PREFIX}:${ephemeralSession.uuid}`, ttl, stringifiedSession)
    pipeline.setex(`${this.PREFIX_PRIVATE_ID}:${ephemeralSession.privateIdentifier}`, ttl, stringifiedSession)

    pipeline.sadd(`${this.USER_SESSIONS_PREFIX}:${ephemeralSession.userUuid}`, ephemeralSession.uuid)
    pipeline.expire(`${this.USER_SESSIONS_PREFIX}:${ephemeralSession.userUuid}`, ttl)

    await pipeline.exec()
  }

  async update(ephemeralSession: EphemeralSession): Promise<void> {
    return this.insert(ephemeralSession)
  }
}
