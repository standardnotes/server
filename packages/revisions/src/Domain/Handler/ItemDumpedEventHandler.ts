import { DomainEventHandlerInterface, ItemDumpedEvent } from '@standardnotes/domain-events'

import { DumpRepositoryInterface } from '../Dump/DumpRepositoryInterface'
import { RevisionRepositoryInterface } from '../Revision/RevisionRepositoryInterface'

export class ItemDumpedEventHandler implements DomainEventHandlerInterface {
  constructor(
    private dumpRepository: DumpRepositoryInterface,
    private revisionRepository: RevisionRepositoryInterface,
  ) {}

  async handle(event: ItemDumpedEvent): Promise<void> {
    const revision = await this.dumpRepository.getRevisionFromDumpPath(event.payload.fileDumpPath)
    if (revision === null) {
      await this.dumpRepository.removeDump(event.payload.fileDumpPath)

      return
    }

    await this.revisionRepository.save(revision)

    await this.dumpRepository.removeDump(event.payload.fileDumpPath)
  }
}
