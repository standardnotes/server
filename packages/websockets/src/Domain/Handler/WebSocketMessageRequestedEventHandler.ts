import { DomainEventHandlerInterface, WebSocketMessageRequestedEvent } from '@standardnotes/domain-events'
import { inject, injectable } from 'inversify'
import { Logger } from 'winston'

import TYPES from '../../Bootstrap/Types'
import { ClientMessengerInterface } from '../../Client/ClientMessengerInterface'

@injectable()
export class WebSocketMessageRequestedEventHandler implements DomainEventHandlerInterface {
  constructor(
    @inject(TYPES.WebSocketsClientMessenger) private webSocketsClientMessenger: ClientMessengerInterface,
    @inject(TYPES.Logger) private logger: Logger,
  ) {}

  async handle(event: WebSocketMessageRequestedEvent): Promise<void> {
    this.logger.debug(`Sending message to user ${event.payload.userUuid}`)

    await this.webSocketsClientMessenger.send(event.payload.userUuid, event.payload.message)
  }
}
