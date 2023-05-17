import { DomainEventInterface } from '../Event/DomainEventInterface'

export interface DomainEventMessageHandlerInterface {
  handleMessage(messageOrEvent: string | DomainEventInterface): Promise<void>
  handleError(error: Error): Promise<void>
}
