import { DomainEventSubscriberInterface } from './DomainEventSubscriberInterface'

export interface DomainEventSubscriberFactoryInterface {
  create(): DomainEventSubscriberInterface
}
