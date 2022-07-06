import { SQS } from 'aws-sdk'
import { Consumer, SQSMessage } from 'sqs-consumer'

import {
  DomainEventMessageHandlerInterface,
  DomainEventSubscriberFactoryInterface,
  DomainEventSubscriberInterface,
} from '@standardnotes/domain-events'

export class SQSDomainEventSubscriberFactory implements DomainEventSubscriberFactoryInterface {
  constructor(
    private sqs: SQS,
    private queueUrl: string,
    private domainEventMessageHandler: DomainEventMessageHandlerInterface,
  ) {}

  create(): DomainEventSubscriberInterface {
    const sqsConsumer = Consumer.create({
      attributeNames: ['All'],
      messageAttributeNames: ['compression', 'event'],
      queueUrl: this.queueUrl,
      sqs: this.sqs,
      handleMessage:
        /* istanbul ignore next */
        async (message: SQSMessage) => await this.domainEventMessageHandler.handleMessage(<string>message.Body),
    })

    sqsConsumer.on('error', this.domainEventMessageHandler.handleError.bind(this.domainEventMessageHandler))
    sqsConsumer.on('processing_error', this.domainEventMessageHandler.handleError.bind(this.domainEventMessageHandler))

    return sqsConsumer
  }
}
