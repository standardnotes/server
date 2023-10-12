import { Consumer } from 'sqs-consumer'
import { Message, SQSClient } from '@aws-sdk/client-sqs'
import {
  DomainEventMessageHandlerInterface,
  DomainEventSubscriberFactoryInterface,
  DomainEventSubscriberInterface,
} from '@standardnotes/domain-events'

export class SQSDomainEventSubscriberFactory implements DomainEventSubscriberFactoryInterface {
  constructor(
    private sqs: SQSClient,
    private queueUrl: string,
    private domainEventMessageHandler: DomainEventMessageHandlerInterface,
  ) {}

  create(): DomainEventSubscriberInterface {
    const sqsConsumer = Consumer.create({
      attributeNames: ['All'],
      messageAttributeNames: ['All'],
      queueUrl: this.queueUrl,
      sqs: this.sqs,
      handleMessage:
        /* istanbul ignore next */
        async (message: Message) => await this.domainEventMessageHandler.handleMessage(<string>message.Body),
    })

    sqsConsumer.on('error', this.domainEventMessageHandler.handleError.bind(this.domainEventMessageHandler))
    sqsConsumer.on('processing_error', this.domainEventMessageHandler.handleError.bind(this.domainEventMessageHandler))

    return sqsConsumer
  }
}
