import 'reflect-metadata'

import { SQSDomainEventSubscriberFactory } from './SQSDomainEventSubscriberFactory'
import { DomainEventMessageHandlerInterface } from '@standardnotes/domain-events'
import { Consumer } from 'sqs-consumer'
import { SQSClient } from '@aws-sdk/client-sqs'

describe('SQSDomainEventSubscriberFactory', () => {
  let sqs: SQSClient
  const queueUrl = 'https://queue-url'
  let domainEventMessageHandler: DomainEventMessageHandlerInterface

  const createFactory = () => new SQSDomainEventSubscriberFactory(sqs, queueUrl, domainEventMessageHandler)

  beforeEach(() => {
    sqs = {} as jest.Mocked<SQSClient>

    domainEventMessageHandler = {} as jest.Mocked<DomainEventMessageHandlerInterface>
    domainEventMessageHandler.handleMessage = jest.fn()
    domainEventMessageHandler.handleError = jest.fn()
  })

  it('should create a domain event subscriber', () => {
    const subscriber = createFactory().create()

    expect(subscriber).toBeInstanceOf(Consumer)
  })
})
