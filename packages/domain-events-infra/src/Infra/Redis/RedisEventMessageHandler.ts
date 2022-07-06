import * as zlib from 'zlib'
import { Logger } from 'winston'

import {
  DomainEventMessageHandlerInterface,
  DomainEventHandlerInterface,
  DomainEventInterface,
} from '@standardnotes/domain-events'

export class RedisEventMessageHandler implements DomainEventMessageHandlerInterface {
  constructor(private handlers: Map<string, DomainEventHandlerInterface>, private logger: Logger) {}

  async handleMessage(message: string): Promise<void> {
    try {
      const domainEventJson = zlib.unzipSync(Buffer.from(message, 'base64')).toString()

      const domainEvent: DomainEventInterface = JSON.parse(domainEventJson)

      const handler = this.handlers.get(domainEvent.type)
      if (!handler) {
        this.logger.debug(`Event handler for event type ${domainEvent.type} does not exist`)

        return
      }

      await handler.handle(domainEvent)
    } catch (error) {
      await this.handleError(error as Error)
    }
  }

  async handleError(error: Error): Promise<void> {
    this.logger.error('Error occured while handling Redis message: %O', error)
  }
}
