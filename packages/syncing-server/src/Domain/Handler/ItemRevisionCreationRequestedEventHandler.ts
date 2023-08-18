import {
  ItemRevisionCreationRequestedEvent,
  DomainEventHandlerInterface,
  DomainEventPublisherInterface,
} from '@standardnotes/domain-events'
import { Uuid } from '@standardnotes/domain-core'

import { DomainEventFactoryInterface } from '../Event/DomainEventFactoryInterface'
import { ItemBackupServiceInterface } from '../Item/ItemBackupServiceInterface'
import { ItemRepositoryInterface } from '../Item/ItemRepositoryInterface'

export class ItemRevisionCreationRequestedEventHandler implements DomainEventHandlerInterface {
  constructor(
    private primaryItemRepository: ItemRepositoryInterface,
    private secondaryItemRepository: ItemRepositoryInterface | null,
    private itemBackupService: ItemBackupServiceInterface,
    private domainEventFactory: DomainEventFactoryInterface,
    private domainEventPublisher: DomainEventPublisherInterface,
  ) {}

  async handle(event: ItemRevisionCreationRequestedEvent): Promise<void> {
    await this.createItemDump(event, this.primaryItemRepository)

    if (this.secondaryItemRepository) {
      await this.createItemDump(event, this.secondaryItemRepository)
    }
  }

  private async createItemDump(
    event: ItemRevisionCreationRequestedEvent,
    itemRepository: ItemRepositoryInterface,
  ): Promise<void> {
    const itemUuidOrError = Uuid.create(event.payload.itemUuid)
    if (itemUuidOrError.isFailed()) {
      return
    }
    const itemUuid = itemUuidOrError.getValue()

    const item = await itemRepository.findByUuid(itemUuid)
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
