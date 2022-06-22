import 'reflect-metadata'

import * as IORedis from 'ioredis'
import { Logger } from 'winston'

import { RedisPKCERepository } from './RedisPKCERepository'

describe('RedisPKCERepository', () => {
  let redisClient: IORedis.Redis
  let logger: Logger

  const createRepository = () => new RedisPKCERepository(redisClient, logger)

  beforeEach(() => {
    redisClient = {} as jest.Mocked<IORedis.Redis>
    redisClient.setex = jest.fn()
    redisClient.del = jest.fn().mockReturnValue(1)

    logger = {} as jest.Mocked<Logger>
    logger.debug = jest.fn()
  })

  it('should store a code challenge', async () => {
    await createRepository().storeCodeChallenge('test')

    expect(redisClient.setex).toHaveBeenCalledWith('pkce:test', 3600, 'test')
  })

  it('should remove a code challenge and notify of success', async () => {
    expect(await createRepository().removeCodeChallenge('test')).toBeTruthy()

    expect(redisClient.del).toHaveBeenCalledWith('pkce:test')
  })
})
