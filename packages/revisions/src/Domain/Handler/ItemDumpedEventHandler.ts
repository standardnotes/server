import { DomainEventHandlerInterface, ItemDumpedEvent } from '@standardnotes/domain-events'

import { Logger } from 'winston'
import { CreateRevisionFromDump } from '../UseCase/CreateRevisionFromDump/CreateRevisionFromDump'

export class ItemDumpedEventHandler implements DomainEventHandlerInterface {
  constructor(
    private createRevisionFromDump: CreateRevisionFromDump,
    private logger: Logger,
  ) {}

  async handle(event: ItemDumpedEvent): Promise<void> {
    const result = await this.createRevisionFromDump.execute({
      filePath: event.payload.fileDumpPath,
    })

    if (result.isFailed()) {
      this.logger.error(`Item dumped event handler failed: ${result.getError()}`)
    }
  }
}
