import { Logger } from 'winston'
import * as zlib from 'zlib'
import {
  DomainEventHandlerInterface,
  DomainEventInterface,
  DomainEventMessageHandlerInterface,
} from '@standardnotes/domain-events'
import { OpenTelemetryTracer } from '../OpenTelemetry/OpenTelemetryTracer'
import { OpenTelemetryTracerInterface } from '../OpenTelemetry/OpenTelemetryTracerInterface'
import { OpenTelemetryPropagationInterface } from '../OpenTelemetry/OpenTelemetryPropagationInterface'

export class SQSOpenTelemetryEventMessageHandler implements DomainEventMessageHandlerInterface {
  private tracer: OpenTelemetryTracerInterface | undefined

  constructor(
    private serviceName: string,
    private propagator: OpenTelemetryPropagationInterface,
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

    this.tracer = new OpenTelemetryTracer()

    let activeContext = undefined
    if (domainEvent.meta.trace) {
      this.logger.debug(`Event has trace: ${JSON.stringify(domainEvent.meta.trace)}`)

      activeContext = this.propagator.extract(domainEvent.meta.trace)
    }

    this.tracer.startSpan(this.serviceName, domainEvent.type, activeContext)

    try {
      await handler.handle(domainEvent)
    } catch (error) {
      this.tracer.stopSpanWithError(error as Error)

      throw error
    }

    this.tracer.stopSpan()
  }

  async handleError(error: Error): Promise<void> {
    this.logger.error('Error occured while handling SQS message: %O', error)
  }
}
