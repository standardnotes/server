import * as IORedis from 'ioredis'

import {
  DomainEventSubscriberFactoryInterface,
  DomainEventSubscriberInterface,
  DomainEventMessageHandlerInterface,
} from '@standardnotes/domain-events'

import { RedisDomainEventSubscriber } from './RedisDomainEventSubscriber'

export class RedisDomainEventSubscriberFactory implements DomainEventSubscriberFactoryInterface {
  constructor(
    private redisClient: IORedis.Redis,
    private domainEventMessageHandler: DomainEventMessageHandlerInterface,
    private eventChannel: string,
  ) {}

  create(): DomainEventSubscriberInterface {
    const subscriber = new RedisDomainEventSubscriber(this.redisClient, this.eventChannel)

    this.redisClient.on(
      'message',
      /* istanbul ignore next */
      async (_channel: string, message: string) => await this.domainEventMessageHandler.handleMessage(message),
    )

    return subscriber
  }
}
