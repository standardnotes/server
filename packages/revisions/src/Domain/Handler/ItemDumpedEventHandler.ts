import { DomainEventHandlerInterface, ItemDumpedEvent } from '@standardnotes/domain-events'

import { DumpRepositoryInterface } from '../Dump/DumpRepositoryInterface'
import { RevisionRepositoryResolverInterface } from '../Revision/RevisionRepositoryResolverInterface'
import { RoleNameCollection } from '@standardnotes/domain-core'

export class ItemDumpedEventHandler implements DomainEventHandlerInterface {
  constructor(
    private dumpRepository: DumpRepositoryInterface,
    private revisionRepositoryResolver: RevisionRepositoryResolverInterface,
  ) {}

  async handle(event: ItemDumpedEvent): Promise<void> {
    const revision = await this.dumpRepository.getRevisionFromDumpPath(event.payload.fileDumpPath)
    if (revision === null) {
      await this.dumpRepository.removeDump(event.payload.fileDumpPath)

      return
    }

    const roleNamesOrError = RoleNameCollection.create(event.payload.roleNames)
    if (roleNamesOrError.isFailed()) {
      await this.dumpRepository.removeDump(event.payload.fileDumpPath)

      return
    }
    const roleNames = roleNamesOrError.getValue()

    const revisionRepository = this.revisionRepositoryResolver.resolve(roleNames)

    await revisionRepository.save(revision)

    await this.dumpRepository.removeDump(event.payload.fileDumpPath)
  }
}
