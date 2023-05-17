import { Logger } from 'winston'

import {
  DomainEventHandlerInterface,
  DomainEventInterface,
  DomainEventMessageHandlerInterface,
} from '@standardnotes/domain-events'

export class DirectCallEventMessageHandler implements DomainEventMessageHandlerInterface {
  constructor(private handlers: Map<string, DomainEventHandlerInterface>, private logger: Logger) {}

  async handleMessage(messageOrEvent: string | DomainEventInterface): Promise<void> {
    if (typeof messageOrEvent === 'string') {
      throw new Error('DirectCallEventMessageHandler does not support string messages')
    }

    const handler = this.handlers.get(messageOrEvent.type)
    if (!handler) {
      this.logger.debug(`Event handler for event type ${messageOrEvent.type} does not exist`)

      return
    }

    this.logger.debug(`Received event: ${messageOrEvent.type}`)

    await handler.handle(messageOrEvent)
  }

  async handleError(error: Error): Promise<void> {
    this.logger.error('Error occured while handling SQS message: %O', error)
  }
}
