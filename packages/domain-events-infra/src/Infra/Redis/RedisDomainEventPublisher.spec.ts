import 'reflect-metadata'

import * as IORedis from 'ioredis'

import { RedisDomainEventPublisher } from './RedisDomainEventPublisher'
import { DomainEventInterface } from '@standardnotes/domain-events'

describe('RedisDomainEventPublisher', () => {
  let redisClient: IORedis.Redis
  let event: DomainEventInterface
  const eventChannel = 'events'

  const createPublisher = () => new RedisDomainEventPublisher(redisClient, eventChannel)

  beforeEach(() => {
    redisClient = {} as jest.Mocked<IORedis.Redis>
    redisClient.publish = jest.fn()

    event = {} as jest.Mocked<DomainEventInterface>
    event.type = 'TEST'
    event.payload = { foo: 'bar' }
  })

  it('should publish an event to a channel', async () => {
    await createPublisher().publish(event)

    expect(redisClient.publish).toHaveBeenCalledWith(
      'events',
      'eJyrViqpLEhVslIKcQ0OUdJRKkiszMlPTFGyqlZKy88HiiclFinV1gIA9tQMhA==',
    )
  })
})
