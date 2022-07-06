import 'reflect-metadata'

import { SQS } from 'aws-sdk'

import { SQSDomainEventSubscriberFactory } from './SQSDomainEventSubscriberFactory'
import { DomainEventMessageHandlerInterface } from '@standardnotes/domain-events'
import { Consumer } from 'sqs-consumer'

describe('SQSDomainEventSubscriberFactory', () => {
  let sqs: SQS
  const queueUrl = 'https://queue-url'
  let domainEventMessageHandler: DomainEventMessageHandlerInterface

  const createFactory = () => new SQSDomainEventSubscriberFactory(sqs, queueUrl, domainEventMessageHandler)

  beforeEach(() => {
    sqs = {} as jest.Mocked<SQS>

    domainEventMessageHandler = {} as jest.Mocked<DomainEventMessageHandlerInterface>
    domainEventMessageHandler.handleMessage = jest.fn()
    domainEventMessageHandler.handleError = jest.fn()
  })

  it('should create a domain event subscriber', () => {
    const subscriber = createFactory().create()

    expect(subscriber).toBeInstanceOf(Consumer)
  })
})
