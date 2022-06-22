import 'reflect-metadata'

import * as IORedis from 'ioredis'

import { RedisWebSocketsConnectionRepository } from './RedisWebSocketsConnectionRepository'

describe('RedisWebSocketsConnectionRepository', () => {
  let redisClient: IORedis.Redis

  const createRepository = () => new RedisWebSocketsConnectionRepository(redisClient)

  beforeEach(() => {
    redisClient = {} as jest.Mocked<IORedis.Redis>
    redisClient.sadd = jest.fn()
    redisClient.set = jest.fn()
    redisClient.get = jest.fn()
    redisClient.srem = jest.fn()
    redisClient.del = jest.fn()
    redisClient.smembers = jest.fn()
  })

  it('should save a connection to set of user connections', async () => {
    await createRepository().saveConnection('1-2-3', '2-3-4')

    expect(redisClient.sadd).toHaveBeenCalledWith('ws_user_connections:1-2-3', '2-3-4')
    expect(redisClient.set).toHaveBeenCalledWith('ws_connection:2-3-4', '1-2-3')
  })

  it('should remove a connection from the set of user connections', async () => {
    redisClient.get = jest.fn().mockReturnValue('1-2-3')

    await createRepository().removeConnection('2-3-4')

    expect(redisClient.srem).toHaveBeenCalledWith('ws_user_connections:1-2-3', '2-3-4')
    expect(redisClient.del).toHaveBeenCalledWith('ws_connection:2-3-4')
  })

  it('should return all connections for a user uuid', async () => {
    const userUuid = '1-2-3'

    await createRepository().findAllByUserUuid(userUuid)
    expect(redisClient.smembers).toHaveBeenCalledWith(`ws_user_connections:${userUuid}`)
  })
})
