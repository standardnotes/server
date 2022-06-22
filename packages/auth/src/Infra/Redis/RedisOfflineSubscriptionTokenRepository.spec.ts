import 'reflect-metadata'

import * as IORedis from 'ioredis'
import { TimerInterface } from '@standardnotes/time'

import { RedisOfflineSubscriptionTokenRepository } from './RedisOfflineSubscriptionTokenRepository'
import { OfflineSubscriptionToken } from '../../Domain/Auth/OfflineSubscriptionToken'
import { Logger } from 'winston'

describe('RedisOfflineSubscriptionTokenRepository', () => {
  let redisClient: IORedis.Redis
  let timer: TimerInterface
  let logger: Logger

  const createRepository = () => new RedisOfflineSubscriptionTokenRepository(redisClient, timer, logger)

  beforeEach(() => {
    redisClient = {} as jest.Mocked<IORedis.Redis>
    redisClient.set = jest.fn()
    redisClient.get = jest.fn()
    redisClient.expireat = jest.fn()

    timer = {} as jest.Mocked<TimerInterface>
    timer.convertMicrosecondsToSeconds = jest.fn().mockReturnValue(1)

    logger = {} as jest.Mocked<Logger>
    logger.debug = jest.fn()
  })

  it('should get a user uuid in exchange for an dashboard token', async () => {
    redisClient.get = jest.fn().mockReturnValue('test@test.com')

    expect(await createRepository().getUserEmailByToken('random-string')).toEqual('test@test.com')

    expect(redisClient.get).toHaveBeenCalledWith('offline-subscription-token:random-string')
  })

  it('should return undefined if a user uuid is not exchanged for an dashboard token', async () => {
    redisClient.get = jest.fn().mockReturnValue(null)

    expect(await createRepository().getUserEmailByToken('random-string')).toBeUndefined()

    expect(redisClient.get).toHaveBeenCalledWith('offline-subscription-token:random-string')
  })

  it('should save an dashboard token', async () => {
    const offlineSubscriptionToken: OfflineSubscriptionToken = {
      userEmail: 'test@test.com',
      token: 'random-string',
      expiresAt: 123,
    }

    await createRepository().save(offlineSubscriptionToken)

    expect(redisClient.set).toHaveBeenCalledWith('offline-subscription-token:random-string', 'test@test.com')

    expect(redisClient.expireat).toHaveBeenCalledWith('offline-subscription-token:random-string', 1)
  })
})
