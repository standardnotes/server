import { Consumer } from 'sqs-consumer'
import * as OpenTelemetryApi from '@opentelemetry/api'
import { Message, SQSClient } from '@aws-sdk/client-sqs'
import { DomainEventSubscriberInterface, DomainEventMessageHandlerInterface } from '@standardnotes/domain-events'
import { Logger } from 'winston'

export class SQSOpenTelemetryDomainEventSubscriber implements DomainEventSubscriberInterface {
  private currentSpan: OpenTelemetryApi.Span | undefined

  constructor(
    private serviceName: string,
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
      preReceiveMessageCallback: this.startParentSpan.bind(this),
      handleMessage: this.handleMessage.bind(this),
    })

    sqsConsumer.on('error', this.handleError.bind(this))
    sqsConsumer.on('processing_error', this.handleError.bind(this))

    sqsConsumer.start()
  }

  async startParentSpan(): Promise<void> {
    const tracer = OpenTelemetryApi.trace.getTracer(`${this.serviceName}-domain-event-subscriber`)

    this.currentSpan = tracer.startSpan(this.serviceName, { kind: OpenTelemetryApi.SpanKind.CONSUMER })
  }

  async handleMessage(message: Message): Promise<void> {
    await this.domainEventMessageHandler.handleMessage(<string>message.Body)

    if (this.currentSpan) {
      this.currentSpan.end()
      this.currentSpan = undefined
    }
  }

  handleError(error: Error): void {
    this.logger.error('Error occured while handling SQS message: %O', error)

    if (this.currentSpan) {
      this.currentSpan.recordException(error)
      this.currentSpan.end()
      this.currentSpan = undefined
    }
  }
}
