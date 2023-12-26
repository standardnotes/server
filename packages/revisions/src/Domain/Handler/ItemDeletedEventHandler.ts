import { DomainEventHandlerInterface, ItemDeletedEvent } from '@standardnotes/domain-events'
import { Logger } from 'winston'

import { DeleteRevisions } from '../UseCase/DeleteRevisions/DeleteRevisions'

export class ItemDeletedEventHandler implements DomainEventHandlerInterface {
  constructor(
    private deleteRevisions: DeleteRevisions,
    private logger: Logger,
  ) {}

  async handle(event: ItemDeletedEvent): Promise<void> {
    const result = await this.deleteRevisions.execute({ itemUuid: event.payload.itemUuid })

    if (result.isFailed()) {
      this.logger.error(`Could not delete revisions for item ${event.payload.itemUuid}: ${result.getError()}`, {
        userId: event.payload.userUuid,
      })
    }
  }
}
