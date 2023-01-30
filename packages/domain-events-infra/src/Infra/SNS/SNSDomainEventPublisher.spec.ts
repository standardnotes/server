import 'reflect-metadata'

import { DomainEventInterface, DomainEventService } from '@standardnotes/domain-events'
import { SNSClient } from '@aws-sdk/client-sns'

import { SNSDomainEventPublisher } from './SNSDomainEventPublisher'

describe('SNSDomainEventPublisher', () => {
  let sns: SNSClient
  const topicArn = 'test-topic-arn'
  let event: DomainEventInterface

  const createPublisher = () => new SNSDomainEventPublisher(sns, topicArn)

  beforeEach(() => {
    sns = {} as jest.Mocked<SNSClient>
    sns.send = jest.fn()

    event = {} as jest.Mocked<DomainEventInterface>
    event.type = 'TEST'
    event.payload = { foo: 'bar' }
    event.createdAt = new Date(1)
    event.meta = {
      correlation: {
        userIdentifier: '1-2-3',
        userIdentifierType: 'uuid',
      },
      origin: DomainEventService.Auth,
    }
  })

  it('should publish a domain event', async () => {
    await createPublisher().publish(event)

    expect(sns.send).toHaveBeenCalled()
  })

  it('should publish a targeted domain event', async () => {
    event.meta.target = DomainEventService.SyncingServer

    await createPublisher().publish(event)

    expect(sns.send).toHaveBeenCalled()
  })
})
