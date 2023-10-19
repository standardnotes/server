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
      this.logger.debug(`Could not find item with uuid ${event.payload.itemUuid}`)

      return
    }

    if (!item.props.duplicateOf) {
      this.logger.debug(`Item ${event.payload.itemUuid} does not point to any duplicate`)

      return
    }

    const existingOriginalItem = await this.itemRepository.findByUuidAndUserUuid(
      item.props.duplicateOf.value,
      event.payload.userUuid,
    )

    if (existingOriginalItem !== null) {
      await this.domainEventPublisher.publish(
        this.domainEventFactory.createRevisionsCopyRequestedEvent(event.payload.userUuid, {
          originalItemUuid: existingOriginalItem.id.toString(),
          newItemUuid: item.id.toString(),
        }),
      )
    }
  }
}
