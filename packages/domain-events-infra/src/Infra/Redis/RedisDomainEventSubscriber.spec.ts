import 'reflect-metadata'

import * as IORedis from 'ioredis'

import { RedisDomainEventSubscriber } from './RedisDomainEventSubscriber'

describe('RedisDomainEventSubscriber', () => {
  let redisClient: IORedis.Redis
  const eventChannel = 'test-channel'

  const createSubscriber = () => new RedisDomainEventSubscriber(redisClient, eventChannel)

  beforeEach(() => {
    redisClient = {} as jest.Mocked<IORedis.Redis>
    redisClient.subscribe = jest.fn()
  })

  it('should start the subscription', () => {
    createSubscriber().start()

    expect(redisClient.subscribe).toHaveBeenCalledWith('test-channel')
  })
})
