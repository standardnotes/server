import {
  DomainEventHandlerInterface,
  DomainEventPublisherInterface,
  DuplicateItemSyncedEvent,
} from '@standardnotes/domain-events'
import { Logger } from 'winston'
import { DomainEventFactoryInterface } from '../Event/DomainEventFactoryInterface'
import { ItemRepositoryInterface } from '../Item/ItemRepositoryInterface'
import { ItemRepositoryResolverInterface } from '../Item/ItemRepositoryResolverInterface'
import { RoleNameCollection } from '@standardnotes/domain-core'

export class DuplicateItemSyncedEventHandler implements DomainEventHandlerInterface {
  constructor(
    private itemRepositoryResolver: ItemRepositoryResolverInterface,
    private domainEventFactory: DomainEventFactoryInterface,
    private domainEventPublisher: DomainEventPublisherInterface,
    private logger: Logger,
  ) {}

  async handle(event: DuplicateItemSyncedEvent): Promise<void> {
    const roleNamesOrError = RoleNameCollection.create(event.payload.roleNames)
    if (roleNamesOrError.isFailed()) {
      return
    }
    const roleNames = roleNamesOrError.getValue()

    const itemRepository = this.itemRepositoryResolver.resolve(roleNames)

    await this.requestRevisionsCopy(event, itemRepository)
  }

  private async requestRevisionsCopy(
    event: DuplicateItemSyncedEvent,
    itemRepository: ItemRepositoryInterface,
  ): Promise<void> {
    const item = await itemRepository.findByUuidAndUserUuid(event.payload.itemUuid, event.payload.userUuid)

    if (item === null) {
      this.logger.debug(`Could not find item with uuid ${event.payload.itemUuid}`)

      return
    }

    if (!item.props.duplicateOf) {
      this.logger.debug(`Item ${event.payload.itemUuid} does not point to any duplicate`)

      return
    }

    const existingOriginalItem = await itemRepository.findByUuidAndUserUuid(
      item.props.duplicateOf.value,
      event.payload.userUuid,
    )

    if (existingOriginalItem !== null) {
      await this.domainEventPublisher.publish(
        this.domainEventFactory.createRevisionsCopyRequestedEvent(event.payload.userUuid, {
          originalItemUuid: existingOriginalItem.id.toString(),
          newItemUuid: item.id.toString(),
          roleNames: event.payload.roleNames,
        }),
      )
    }
  }
}
