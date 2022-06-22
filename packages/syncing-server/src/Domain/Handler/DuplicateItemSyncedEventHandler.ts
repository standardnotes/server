import { DomainEventHandlerInterface, DuplicateItemSyncedEvent } from '@standardnotes/domain-events'
import { inject, injectable } from 'inversify'
import { Logger } from 'winston'
import TYPES from '../../Bootstrap/Types'
import { ItemRepositoryInterface } from '../Item/ItemRepositoryInterface'
import { RevisionServiceInterface } from '../Revision/RevisionServiceInterface'

@injectable()
export class DuplicateItemSyncedEventHandler implements DomainEventHandlerInterface {
  constructor(
    @inject(TYPES.ItemRepository) private itemRepository: ItemRepositoryInterface,
    @inject(TYPES.RevisionService) private revisionService: RevisionServiceInterface,
    @inject(TYPES.Logger) private logger: Logger,
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

    if (existingOriginalItem !== null) {
      await this.revisionService.copyRevisions(existingOriginalItem.uuid, item.uuid)
    }
  }
}
