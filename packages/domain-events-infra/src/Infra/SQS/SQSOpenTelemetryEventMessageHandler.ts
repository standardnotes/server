import { Logger } from 'winston'
import * as zlib from 'zlib'
import * as OpenTelemetryApi from '@opentelemetry/api'
import {
  DomainEventHandlerInterface,
  DomainEventInterface,
  DomainEventMessageHandlerInterface,
} from '@standardnotes/domain-events'

export class SQSOpenTelemetryEventMessageHandler implements DomainEventMessageHandlerInterface {
  private currentSpan: OpenTelemetryApi.Span | undefined
  private internalSpan: OpenTelemetryApi.Span | undefined

  constructor(
    private serviceName: string,
    private handlers: Map<string, DomainEventHandlerInterface>,
    private logger: Logger,
  ) {}

  async handleMessage(message: string): Promise<void> {
    const messageParsed = JSON.parse(message)

    const domainEventJson = zlib.unzipSync(Buffer.from(messageParsed.Message, 'base64')).toString()

    const domainEvent: DomainEventInterface = JSON.parse(domainEventJson)

    domainEvent.createdAt = new Date(domainEvent.createdAt)

    const handler = this.handlers.get(domainEvent.type)
    if (!handler) {
      this.logger.debug(`Event handler for event type ${domainEvent.type} does not exist`)

      return
    }

    this.logger.debug(`Received event: ${domainEvent.type}`)

    const tracer = OpenTelemetryApi.trace.getTracer('sqs-handler')

    this.currentSpan = tracer.startSpan(this.serviceName, { kind: OpenTelemetryApi.SpanKind.CONSUMER })
    this.internalSpan = tracer.startSpan(domainEvent.type, { kind: OpenTelemetryApi.SpanKind.INTERNAL })

    await handler.handle(domainEvent)

    this.internalSpan.end()
    this.currentSpan.end()

    this.internalSpan = undefined
    this.currentSpan = undefined
  }

  async handleError(error: Error): Promise<void> {
    if (this.internalSpan) {
      this.internalSpan.recordException(error)
      this.internalSpan.end()
      this.internalSpan = undefined
    }

    if (this.currentSpan) {
      this.currentSpan.end()
      this.currentSpan = undefined
    }

    this.logger.error('Error occured while handling SQS message: %O', error)
  }
}
