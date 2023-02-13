import {
  ItemRevisionCreationRequestedEvent,
  DomainEventHandlerInterface,
  DomainEventPublisherInterface,
} from '@standardnotes/domain-events'

import { DomainEventFactoryInterface } from '../Event/DomainEventFactoryInterface'
import { ItemBackupServiceInterface } from '../Item/ItemBackupServiceInterface'
import { ItemRepositoryInterface } from '../Item/ItemRepositoryInterface'

export class ItemRevisionCreationRequestedEventHandler implements DomainEventHandlerInterface {
  constructor(
    private itemRepository: ItemRepositoryInterface,
    private itemBackupService: ItemBackupServiceInterface,
    private domainEventFactory: DomainEventFactoryInterface,
    private domainEventPublisher: DomainEventPublisherInterface,
  ) {}

  async handle(event: ItemRevisionCreationRequestedEvent): Promise<void> {
    const item = await this.itemRepository.findByUuid(event.payload.itemUuid)
    if (item === null) {
      return
    }

    const fileDumpPath = await this.itemBackupService.dump(item)
    if (fileDumpPath) {
      await this.domainEventPublisher.publish(
        this.domainEventFactory.createItemDumpedEvent(fileDumpPath, event.meta.correlation.userIdentifier),
      )
    }
  }
}
