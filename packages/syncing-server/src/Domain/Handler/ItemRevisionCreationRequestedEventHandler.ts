import {
  ItemRevisionCreationRequestedEvent,
  DomainEventHandlerInterface,
  DomainEventPublisherInterface,
} from '@standardnotes/domain-events'
import { RoleNameCollection, Uuid } from '@standardnotes/domain-core'

import { DomainEventFactoryInterface } from '../Event/DomainEventFactoryInterface'
import { ItemBackupServiceInterface } from '../Item/ItemBackupServiceInterface'
import { ItemRepositoryInterface } from '../Item/ItemRepositoryInterface'
import { ItemRepositoryResolverInterface } from '../Item/ItemRepositoryResolverInterface'

export class ItemRevisionCreationRequestedEventHandler implements DomainEventHandlerInterface {
  constructor(
    private itemRepositoryResolver: ItemRepositoryResolverInterface,
    private itemBackupService: ItemBackupServiceInterface,
    private domainEventFactory: DomainEventFactoryInterface,
    private domainEventPublisher: DomainEventPublisherInterface,
  ) {}

  async handle(event: ItemRevisionCreationRequestedEvent): Promise<void> {
    const roleNamesOrError = RoleNameCollection.create(event.payload.roleNames)
    if (roleNamesOrError.isFailed()) {
      return
    }
    const roleNames = roleNamesOrError.getValue()

    const itemRepository = this.itemRepositoryResolver.resolve(roleNames)

    await this.createItemDump(event, itemRepository)
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
        this.domainEventFactory.createItemDumpedEvent({
          fileDumpPath,
          userUuid: event.meta.correlation.userIdentifier,
          roleNames: event.payload.roleNames,
        }),
      )
    }
  }
}
