import { DomainEventHandlerInterface, WebSocketMessageRequestedEvent } from '@standardnotes/domain-events'
import { inject, injectable } from 'inversify'

import TYPES from '../../Bootstrap/Types'
import { ClientMessengerInterface } from '../../Client/ClientMessengerInterface'

@injectable()
export class WebSocketMessageRequestedEventHandler implements DomainEventHandlerInterface {
  constructor(@inject(TYPES.WebSocketsClientMessenger) private webSocketsClientMessenger: ClientMessengerInterface) {}

  async handle(event: WebSocketMessageRequestedEvent): Promise<void> {
    await this.webSocketsClientMessenger.send(event.payload.userUuid, event.payload.message)
  }
}
