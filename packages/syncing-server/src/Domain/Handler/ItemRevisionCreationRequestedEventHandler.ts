import { ItemRevisionCreationRequestedEvent, DomainEventHandlerInterface } from '@standardnotes/domain-events'
import { inject, injectable } from 'inversify'

import TYPES from '../../Bootstrap/Types'
import { ItemRepositoryInterface } from '../Item/ItemRepositoryInterface'
import { RevisionServiceInterface } from '../Revision/RevisionServiceInterface'

@injectable()
export class ItemRevisionCreationRequestedEventHandler implements DomainEventHandlerInterface {
  constructor(
    @inject(TYPES.ItemRepository) private itemRepository: ItemRepositoryInterface,
    @inject(TYPES.RevisionService) private revisionService: RevisionServiceInterface,
  ) {}

  async handle(event: ItemRevisionCreationRequestedEvent): Promise<void> {
    const item = await this.itemRepository.findByUuid(event.payload.itemUuid)
    if (item === null) {
      return
    }

    await this.revisionService.createRevision(item)
  }
}
