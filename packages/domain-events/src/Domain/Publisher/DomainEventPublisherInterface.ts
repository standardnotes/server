import { DomainEventInterface } from '../Event/DomainEventInterface'

export interface DomainEventPublisherInterface {
  publish(event: DomainEventInterface): Promise<void>
}
