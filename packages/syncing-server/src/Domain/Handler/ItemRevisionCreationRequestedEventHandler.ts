import { ItemRevisionCreationRequestedEvent, DomainEventHandlerInterface } from '@standardnotes/domain-events'

import { DumpItem } from '../UseCase/Syncing/DumpItem/DumpItem'
import { Logger } from 'winston'

export class ItemRevisionCreationRequestedEventHandler implements DomainEventHandlerInterface {
  constructor(
    private dumpItem: DumpItem,
    private logger: Logger,
  ) {}

  async handle(event: ItemRevisionCreationRequestedEvent): Promise<void> {
    const result = await this.dumpItem.execute({
      itemUuid: event.payload.itemUuid,
    })

    if (result.isFailed()) {
      this.logger.error(`Item revision requested handler failed: ${result.getError()}`)
    }
  }
}
