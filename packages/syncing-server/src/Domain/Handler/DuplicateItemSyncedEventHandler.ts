import {
  DomainEventHandlerInterface,
  DomainEventPublisherInterface,
  DuplicateItemSyncedEvent,
} from '@standardnotes/domain-events'
import { Logger } from 'winston'
import { DomainEventFactoryInterface } from '../Event/DomainEventFactoryInterface'
import { ItemRepositoryInterface } from '../Item/ItemRepositoryInterface'

export class DuplicateItemSyncedEventHandler implements DomainEventHandlerInterface {
  constructor(
    private itemRepository: ItemRepositoryInterface,
    private domainEventFactory: DomainEventFactoryInterface,
    private domainEventPublisher: DomainEventPublisherInterface,
    private logger: Logger,
  ) {}

  async handle(event: DuplicateItemSyncedEvent): Promise<void> {
    const item = await this.itemRepository.findByUuidAndUserUuid(event.payload.itemUuid, event.payload.userUuid)

    if (item === null) {
      this.logger.warn(`Could not find item with uuid ${event.payload.itemUuid}`)

      return
    }

    if (!item.duplicateOf) {
      this.logger.warn(`Item ${event.payload.itemUuid} does not point to any duplicate`)

      return
    }

    const existingOriginalItem = await this.itemRepository.findByUuidAndUserUuid(
      item.duplicateOf,
      event.payload.userUuid,
    )

    if (existingOriginalItem != null) {
      await this.domainEventPublisher.publish(
        this.domainEventFactory.createRevisionsCopyRequestedEvent(event.payload.userUuid, {
          originalItemUuid: existingOriginalItem.uuid,
          newItemUuid: item.uuid,
        }),
      )
    }
  }
}
