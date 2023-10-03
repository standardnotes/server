import { Logger } from 'winston'
import * as zlib from 'zlib'
import { Segment, Subsegment, captureAsyncFunc } from 'aws-xray-sdk'

import {
  DomainEventHandlerInterface,
  DomainEventInterface,
  DomainEventMessageHandlerInterface,
} from '@standardnotes/domain-events'

export class SQSXRayEventMessageHandler implements DomainEventMessageHandlerInterface {
  constructor(
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

    const xRaySegment = new Segment(domainEvent.type)

    if (domainEvent.meta.correlation.userIdentifierType === 'uuid') {
      xRaySegment.setUser(domainEvent.meta.correlation.userIdentifier)
    }

    await captureAsyncFunc(
      `${handler.constructor.name}.handle}`,
      async (subsegment?: Subsegment) => {
        await handler.handle(domainEvent)

        if (subsegment) {
          subsegment.close()
        }
      },
      xRaySegment,
    )

    xRaySegment.close()
    xRaySegment.flush()
  }

  async handleError(error: Error): Promise<void> {
    this.logger.error('Error occured while handling SQS message: %O', error)
  }
}
