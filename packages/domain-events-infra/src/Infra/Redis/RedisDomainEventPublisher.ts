import * as IORedis from 'ioredis'
import * as zlib from 'zlib'

import { DomainEventPublisherInterface, DomainEventInterface } from '@standardnotes/domain-events'

export class RedisDomainEventPublisher implements DomainEventPublisherInterface {
  constructor(
    private redisClient: IORedis.Redis,
    private eventChannel: string,
  ) {}

  async publish(event: DomainEventInterface): Promise<void> {
    const message = zlib.deflateSync(JSON.stringify(event)).toString('base64')

    await this.redisClient.publish(this.eventChannel, message)
  }
}
