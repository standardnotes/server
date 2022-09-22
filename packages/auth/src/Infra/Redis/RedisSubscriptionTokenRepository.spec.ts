import 'reflect-metadata'

import * as IORedis from 'ioredis'

import { RedisSubscriptionTokenRepository } from './RedisSubscriptionTokenRepository'
import { SubscriptionToken } from '../../Domain/Subscription/SubscriptionToken'

describe('RedisSubscriptionTokenRepository', () => {
  let redisClient: IORedis.Redis

  const createRepository = () => new RedisSubscriptionTokenRepository(redisClient)

  beforeEach(() => {
    redisClient = {} as jest.Mocked<IORedis.Redis>
    redisClient.setex = jest.fn().mockReturnValue('OK')
    redisClient.get = jest.fn()
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
      ttl: 123,
    }

    expect(await createRepository().save(subscriptionToken)).toBeTruthy()

    expect(redisClient.setex).toHaveBeenCalledWith('subscription-token:random-string', 123, '1-2-3')
  })

  it('should indicate subscription token was not saved', async () => {
    redisClient.setex = jest.fn().mockReturnValue(null)

    const subscriptionToken: SubscriptionToken = {
      userUuid: '1-2-3',
      token: 'random-string',
      ttl: 123,
    }

    expect(await createRepository().save(subscriptionToken)).toBeFalsy()

    expect(redisClient.setex).toHaveBeenCalledWith('subscription-token:random-string', 123, '1-2-3')
  })
})
