import { DomainEventInterface } from '../Event/DomainEventInterface'

export interface DomainEventHandlerInterface {
  handle(event: DomainEventInterface): Promise<void>
}
