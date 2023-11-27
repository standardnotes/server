import { DomainEventHandlerInterface, WebSocketMessageRequestedEvent } from '@standardnotes/domain-events'
import { Logger } from 'winston'
import { SendMessageToClient } from '../UseCase/SendMessageToClient/SendMessageToClient'

export class WebSocketMessageRequestedEventHandler implements DomainEventHandlerInterface {
  constructor(
    private sendMessageToClient: SendMessageToClient,
    private logger: Logger,
  ) {}

  async handle(event: WebSocketMessageRequestedEvent): Promise<void> {
    const result = await this.sendMessageToClient.execute({
      userUuid: event.payload.userUuid,
      message: event.payload.message,
      originatingSessionUuid: event.payload.originatingSessionUuid,
    })

    if (result.isFailed()) {
      this.logger.error(`Could not send message to user ${event.payload.userUuid}. Error: ${result.getError()}`)
    }
  }
}
