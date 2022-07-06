import 'reflect-metadata'

import * as IORedis from 'ioredis'

import { RedisDomainEventSubscriberFactory } from './RedisDomainEventSubscriberFactory'
import { DomainEventMessageHandlerInterface } from '@standardnotes/domain-events'
import { RedisDomainEventSubscriber } from './RedisDomainEventSubscriber'

describe('RedisDomainEventSubscriberFactory', () => {
  let redisClient: IORedis.Redis
  let domainEventMessageHandler: DomainEventMessageHandlerInterface
  const eventChannel = 'events'

  const createFactory = () =>
    new RedisDomainEventSubscriberFactory(redisClient, domainEventMessageHandler, eventChannel)

  beforeEach(() => {
    redisClient = {} as jest.Mocked<IORedis.Redis>
    redisClient.on = jest.fn()

    domainEventMessageHandler = {} as jest.Mocked<DomainEventMessageHandlerInterface>
    domainEventMessageHandler.handleMessage = jest.fn()
  })

  it('should create an event subscriber', () => {
    const subscriber = createFactory().create()

    expect(subscriber).toBeInstanceOf(RedisDomainEventSubscriber)
    expect(redisClient.on).toHaveBeenCalledWith('message', expect.any(Function))
  })
})
