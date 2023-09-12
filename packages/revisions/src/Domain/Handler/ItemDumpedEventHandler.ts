import { DomainEventHandlerInterface, ItemDumpedEvent } from '@standardnotes/domain-events'

import { DumpRepositoryInterface } from '../Dump/DumpRepositoryInterface'
import { RevisionRepositoryResolverInterface } from '../Revision/RevisionRepositoryResolverInterface'
import { RoleNameCollection } from '@standardnotes/domain-core'
import { Logger } from 'winston'

export class ItemDumpedEventHandler implements DomainEventHandlerInterface {
  constructor(
    private dumpRepository: DumpRepositoryInterface,
    private revisionRepositoryResolver: RevisionRepositoryResolverInterface,
    private logger: Logger,
  ) {}

  async handle(event: ItemDumpedEvent): Promise<void> {
    const revision = await this.dumpRepository.getRevisionFromDumpPath(event.payload.fileDumpPath)
    if (revision === null) {
      this.logger.error(`Revision not found for dump path ${event.payload.fileDumpPath}`)

      await this.dumpRepository.removeDump(event.payload.fileDumpPath)

      return
    }

    const roleNamesOrError = RoleNameCollection.create(event.payload.roleNames)
    if (roleNamesOrError.isFailed()) {
      this.logger.error(`Invalid role names ${event.payload.roleNames}`)

      await this.dumpRepository.removeDump(event.payload.fileDumpPath)

      return
    }
    const roleNames = roleNamesOrError.getValue()

    const revisionRepository = this.revisionRepositoryResolver.resolve(roleNames)

    const successfullyInserted = await revisionRepository.insert(revision)
    if (!successfullyInserted) {
      this.logger.error(`Could not insert revision ${revision.id.toString()}`)
    }

    await this.dumpRepository.removeDump(event.payload.fileDumpPath)
  }
}
