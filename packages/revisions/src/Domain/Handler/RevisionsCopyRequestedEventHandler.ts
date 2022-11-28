import { DomainEventHandlerInterface, RevisionsCopyRequestedEvent } from '@standardnotes/domain-events'
import { Logger } from 'winston'
import { CopyRevisions } from '../UseCase/CopyRevisions/CopyRevisions'

export class RevisionsCopyRequestedEventHandler implements DomainEventHandlerInterface {
  constructor(private copyRevisions: CopyRevisions, private logger: Logger) {}

  async handle(event: RevisionsCopyRequestedEvent): Promise<void> {
    const result = await this.copyRevisions.execute({
      newItemUuid: event.payload.newItemUuid,
      originalItemUuid: event.payload.originalItemUuid,
    })

    if (result.isFailed()) {
      this.logger.error(`Could not copy revisions: ${result.getError()}`)
    }
  }
}
