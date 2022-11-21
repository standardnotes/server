import {
  ItemRevisionCreationRequestedEvent,
  DomainEventHandlerInterface,
  DomainEventPublisherInterface,
} from '@standardnotes/domain-events'
import { inject, injectable } from 'inversify'

import TYPES from '../../Bootstrap/Types'
import { DomainEventFactoryInterface } from '../Event/DomainEventFactoryInterface'
import { ItemBackupServiceInterface } from '../Item/ItemBackupServiceInterface'
import { ItemRepositoryInterface } from '../Item/ItemRepositoryInterface'

@injectable()
export class ItemRevisionCreationRequestedEventHandler implements DomainEventHandlerInterface {
  constructor(
    @inject(TYPES.ItemRepository) private itemRepository: ItemRepositoryInterface,
    @inject(TYPES.ItemBackupService) private itemBackupService: ItemBackupServiceInterface,
    @inject(TYPES.DomainEventFactory) private domainEventFactory: DomainEventFactoryInterface,
    @inject(TYPES.DomainEventPublisher) private domainEventPublisher: DomainEventPublisherInterface,
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
