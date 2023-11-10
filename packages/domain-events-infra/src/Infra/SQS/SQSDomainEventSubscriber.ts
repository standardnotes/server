import { Consumer } from 'sqs-consumer'
import { Message, SQSClient } from '@aws-sdk/client-sqs'
import { DomainEventSubscriberInterface, DomainEventMessageHandlerInterface } from '@standardnotes/domain-events'
import { Logger } from 'winston'

export class SQSDomainEventSubscriber implements DomainEventSubscriberInterface {
  private consumer: Consumer | undefined

  constructor(
    private sqs: SQSClient,
    private queueUrl: string,
    private domainEventMessageHandler: DomainEventMessageHandlerInterface,
    private logger: Logger,
  ) {}

  start(): void {
    const sqsConsumer = Consumer.create({
      attributeNames: ['All'],
      messageAttributeNames: ['All'],
      queueUrl: this.queueUrl,
      sqs: this.sqs,
      handleMessage: this.handleMessage.bind(this),
    })

    sqsConsumer.on('error', this.handleError.bind(this))
    sqsConsumer.on('processing_error', this.handleError.bind(this))

    this.consumer = sqsConsumer

    sqsConsumer.start()
  }

  stop(): void {
    if (this.consumer && this.consumer.isRunning) {
      this.logger.info('Stopping SQS consumer...')
      this.consumer.stop()
    }
  }

  async handleMessage(message: Message): Promise<void> {
    await this.domainEventMessageHandler.handleMessage(<string>message.Body)
  }

  handleError(error: Error): void {
    this.logger.error('Error occured while handling SQS message: %O', error)
  }
}
