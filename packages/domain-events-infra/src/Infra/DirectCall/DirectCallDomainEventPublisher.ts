import {
  DomainEventInterface,
  DomainEventMessageHandlerInterface,
  DomainEventPublisherInterface,
} from '@standardnotes/domain-events'

export class DirectCallDomainEventPublisher implements DomainEventPublisherInterface {
  private handlers: Array<DomainEventMessageHandlerInterface> = []

  register(domainEventMessageHandler: DomainEventMessageHandlerInterface): void {
    this.handlers.push(domainEventMessageHandler)
  }

  async publish(event: DomainEventInterface): Promise<void> {
    await Promise.all(this.handlers.map((handler) => handler.handleMessage(event)))
  }
}
