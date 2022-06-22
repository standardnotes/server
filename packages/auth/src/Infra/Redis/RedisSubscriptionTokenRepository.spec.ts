import 'reflect-metadata'

import * as IORedis from 'ioredis'
import { TimerInterface } from '@standardnotes/time'

import { RedisSubscriptionTokenRepository } from './RedisSubscriptionTokenRepository'
import { SubscriptionToken } from '../../Domain/Subscription/SubscriptionToken'

describe('RedisSubscriptionTokenRepository', () => {
  let redisClient: IORedis.Redis
  let timer: TimerInterface

  const createRepository = () => new RedisSubscriptionTokenRepository(redisClient, timer)

  beforeEach(() => {
    redisClient = {} as jest.Mocked<IORedis.Redis>
    redisClient.set = jest.fn()
    redisClient.get = jest.fn()
    redisClient.expireat = jest.fn()

    timer = {} as jest.Mocked<TimerInterface>
    timer.convertMicrosecondsToSeconds = jest.fn().mockReturnValue(1)
  })

  it('should get a user uuid in exchange for an subscription token', async () => {
    redisClient.get = jest.fn().mockReturnValue('1-2-3')

    expect(await createRepository().getUserUuidByToken('random-string')).toEqual('1-2-3')

    expect(redisClient.get).toHaveBeenCalledWith('subscription-token:random-string')
  })

  it('should return undefined if a user uuid is not exchanged for an subscription token', async () => {
    redisClient.get = jest.fn().mockReturnValue(null)

    expect(await createRepository().getUserUuidByToken('random-string')).toBeUndefined()

    expect(redisClient.get).toHaveBeenCalledWith('subscription-token:random-string')
  })

  it('should save an subscription token', async () => {
    const subscriptionToken: SubscriptionToken = {
      userUuid: '1-2-3',
      token: 'random-string',
      expiresAt: 123,
    }

    await createRepository().save(subscriptionToken)

    expect(redisClient.set).toHaveBeenCalledWith('subscription-token:random-string', '1-2-3')

    expect(redisClient.expireat).toHaveBeenCalledWith('subscription-token:random-string', 1)
  })
})
