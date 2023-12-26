import {
  RevisionsCleanupRequestedEvent,
  DomainEventHandlerInterface,
  DomainEventPublisherInterface,
} from '@standardnotes/domain-events'

import { Logger } from 'winston'
import { ItemRepositoryInterface } from '../Item/ItemRepositoryInterface'
import { DomainEventFactoryInterface } from '../Event/DomainEventFactoryInterface'

export class RevisionsCleanupRequestedEventHandler implements DomainEventHandlerInterface {
  constructor(
    private itemRepository: ItemRepositoryInterface,
    private domainEventFactory: DomainEventFactoryInterface,
    private domainEventPublisher: DomainEventPublisherInterface,
    private logger: Logger,
  ) {}

  async handle(event: RevisionsCleanupRequestedEvent): Promise<void> {
    const totalDeletedItems = await this.itemRepository.countAll({
      userUuid: event.payload.userUuid,
      deleted: true,
    })

    this.logger.info(`Found ${totalDeletedItems} deleted items`, {
      userId: event.payload.userUuid,
    })

    const limitPerPage = 100
    const numberOfPages = Math.ceil(totalDeletedItems / limitPerPage)

    for (let i = 0; i < numberOfPages; i++) {
      const items = await this.itemRepository.findAll({
        userUuid: event.payload.userUuid,
        deleted: true,
        offset: i * limitPerPage,
        limit: limitPerPage,
        sortOrder: 'ASC',
        sortBy: 'created_at_timestamp',
      })

      for (const item of items) {
        await this.domainEventPublisher.publish(
          this.domainEventFactory.createItemDeletedEvent({
            itemUuid: item.id.toString(),
            userUuid: item.props.userUuid.value,
          }),
        )
      }
    }

    this.logger.info(`Finished processing ${totalDeletedItems} deleted items`, {
      userId: event.payload.userUuid,
    })
  }
}
