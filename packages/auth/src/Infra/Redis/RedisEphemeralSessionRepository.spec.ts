import 'reflect-metadata'

import * as IORedis from 'ioredis'

import { RedisEphemeralSessionRepository } from './RedisEphemeralSessionRepository'
import { EphemeralSession } from '../../Domain/Session/EphemeralSession'

describe('RedisEphemeralSessionRepository', () => {
  let redisClient: IORedis.Redis
  let pipeline: IORedis.Pipeline

  const createRepository = () => new RedisEphemeralSessionRepository(redisClient, 3600)

  beforeEach(() => {
    redisClient = {} as jest.Mocked<IORedis.Redis>

    redisClient.get = jest.fn()
    redisClient.smembers = jest.fn()

    pipeline = {} as jest.Mocked<IORedis.Pipeline>
    pipeline.setex = jest.fn()
    pipeline.expire = jest.fn()
    pipeline.sadd = jest.fn()
    pipeline.del = jest.fn()
    pipeline.srem = jest.fn()
    pipeline.exec = jest.fn()

    redisClient.pipeline = jest.fn().mockReturnValue(pipeline)
  })

  it('should delete an ephemeral', async () => {
    await createRepository().deleteOne('1-2-3', '2-3-4')

    expect(pipeline.del).toHaveBeenCalledWith('session:1-2-3:2-3-4')
    expect(pipeline.del).toHaveBeenCalledWith('session:1-2-3')
    expect(pipeline.srem).toHaveBeenCalledWith('user-sessions:2-3-4', '1-2-3')
  })

  it('should save an ephemeral session', async () => {
    const ephemeralSession = new EphemeralSession()
    ephemeralSession.uuid = '1-2-3'
    ephemeralSession.userUuid = '2-3-4'
    ephemeralSession.userAgent = 'Mozilla Firefox'
    ephemeralSession.createdAt = new Date(1)
    ephemeralSession.updatedAt = new Date(2)

    await createRepository().save(ephemeralSession)

    expect(pipeline.setex).toHaveBeenCalledWith(
      'session:1-2-3:2-3-4',
      3600,
      '{"uuid":"1-2-3","userUuid":"2-3-4","userAgent":"Mozilla Firefox","createdAt":"1970-01-01T00:00:00.001Z","updatedAt":"1970-01-01T00:00:00.002Z"}',
    )
    expect(pipeline.sadd).toHaveBeenCalledWith('user-sessions:2-3-4', '1-2-3')
    expect(pipeline.expire).toHaveBeenCalledWith('user-sessions:2-3-4', 3600)
  })

  it('should find all ephemeral sessions by user uuid', async () => {
    redisClient.smembers = jest.fn().mockReturnValue(['1-2-3', '2-3-4', '3-4-5'])

    redisClient.get = jest
      .fn()
      .mockReturnValueOnce(
        '{"uuid":"1-2-3","userUuid":"2-3-4","userAgent":"Mozilla Firefox","createdAt":"1970-01-01T00:00:00.001Z","updatedAt":"1970-01-01T00:00:00.002Z"}',
      )
      .mockReturnValueOnce(
        '{"uuid":"2-3-4","userUuid":"2-3-4","userAgent":"Google Chrome","createdAt":"1970-01-01T00:00:00.001Z","updatedAt":"1970-01-01T00:00:00.002Z"}',
      )
      .mockReturnValueOnce(null)

    const ephemeralSessions = await createRepository().findAllByUserUuid('2-3-4')

    expect(ephemeralSessions.length).toEqual(2)
    expect(ephemeralSessions[1].userAgent).toEqual('Google Chrome')
  })

  it('should find an ephemeral session by uuid', async () => {
    redisClient.get = jest
      .fn()
      .mockReturnValue(
        '{"uuid":"1-2-3","userUuid":"2-3-4","userAgent":"Mozilla Firefox","createdAt":"1970-01-01T00:00:00.001Z","updatedAt":"1970-01-01T00:00:00.002Z"}',
      )

    const ephemeralSession = <EphemeralSession>await createRepository().findOneByUuid('1-2-3')

    expect(ephemeralSession).not.toBeUndefined()
    expect(ephemeralSession.userAgent).toEqual('Mozilla Firefox')
  })

  it('should find an ephemeral session by uuid and user uuid', async () => {
    redisClient.get = jest
      .fn()
      .mockReturnValue(
        '{"uuid":"1-2-3","userUuid":"2-3-4","userAgent":"Mozilla Firefox","createdAt":"1970-01-01T00:00:00.001Z","updatedAt":"1970-01-01T00:00:00.002Z"}',
      )

    const ephemeralSession = <EphemeralSession>await createRepository().findOneByUuidAndUserUuid('1-2-3', '2-3-4')

    expect(ephemeralSession).not.toBeUndefined()
    expect(ephemeralSession.userAgent).toEqual('Mozilla Firefox')
  })

  it('should return undefined if session is not found', async () => {
    redisClient.get = jest.fn().mockReturnValue(null)

    const ephemeralSession = <EphemeralSession>await createRepository().findOneByUuid('1-2-3')

    expect(ephemeralSession).toBeNull()
  })

  it('should return undefined if ephemeral session is not found', async () => {
    redisClient.get = jest.fn().mockReturnValue(null)

    const ephemeralSession = <EphemeralSession>await createRepository().findOneByUuidAndUserUuid('1-2-3', '2-3-4')

    expect(ephemeralSession).toBeNull()
  })

  it('should update tokens and expirations dates', async () => {
    redisClient.get = jest
      .fn()
      .mockReturnValue(
        '{"uuid":"1-2-3","userUuid":"2-3-4","userAgent":"Mozilla Firefox","createdAt":"1970-01-01T00:00:00.001Z","updatedAt":"1970-01-01T00:00:00.002Z"}',
      )

    await createRepository().updateTokensAndExpirationDates(
      '1-2-3',
      'dummy_access_token',
      'dummy_refresh_token',
      new Date(3),
      new Date(4),
    )

    expect(pipeline.setex).toHaveBeenCalledWith(
      'session:1-2-3:2-3-4',
      3600,
      '{"uuid":"1-2-3","userUuid":"2-3-4","userAgent":"Mozilla Firefox","createdAt":"1970-01-01T00:00:00.001Z","updatedAt":"1970-01-01T00:00:00.002Z","hashedAccessToken":"dummy_access_token","hashedRefreshToken":"dummy_refresh_token","accessExpiration":"1970-01-01T00:00:00.003Z","refreshExpiration":"1970-01-01T00:00:00.004Z"}',
    )
  })

  it('should not update tokens and expirations dates if the ephemeral session does not exist', async () => {
    await createRepository().updateTokensAndExpirationDates(
      '1-2-3',
      'dummy_access_token',
      'dummy_refresh_token',
      new Date(3),
      new Date(4),
    )

    expect(pipeline.setex).not.toHaveBeenCalled()
  })
})
