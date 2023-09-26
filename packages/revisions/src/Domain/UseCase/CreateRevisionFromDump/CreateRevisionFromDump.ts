import { Result, RoleNameCollection, UseCaseInterface, Validator } from '@standardnotes/domain-core'
import { DumpRepositoryInterface } from '../../Dump/DumpRepositoryInterface'
import { RevisionRepositoryResolverInterface } from '../../Revision/RevisionRepositoryResolverInterface'
import { CreateRevisionFromDumpDTO } from './CreateRevisionFromDumpDTO'

export class CreateRevisionFromDump implements UseCaseInterface<void> {
  constructor(
    private dumpRepository: DumpRepositoryInterface,
    private revisionRepositoryResolver: RevisionRepositoryResolverInterface,
  ) {}

  async execute(dto: CreateRevisionFromDumpDTO): Promise<Result<void>> {
    const filePathValidationResult = Validator.isNotEmptyString(dto.filePath)
    if (filePathValidationResult.isFailed()) {
      return Result.fail(`Could not create revision from dump: ${filePathValidationResult.getError()}`)
    }

    const revision = await this.dumpRepository.getRevisionFromDumpPath(dto.filePath)
    if (revision === null) {
      await this.dumpRepository.removeDump(dto.filePath)

      return Result.fail(`Revision not found in dump path ${dto.filePath}`)
    }

    const roleNamesOrError = RoleNameCollection.create(dto.roleNames)
    if (roleNamesOrError.isFailed()) {
      await this.dumpRepository.removeDump(dto.filePath)

      return Result.fail(`Could not create revision from dump: ${roleNamesOrError.getError()}`)
    }
    const roleNames = roleNamesOrError.getValue()

    const revisionRepository = this.revisionRepositoryResolver.resolve(roleNames)

    const successfullyInserted = await revisionRepository.insert(revision)
    if (!successfullyInserted) {
      await this.dumpRepository.removeDump(dto.filePath)

      return Result.fail(`Could not insert revision from dump: ${revision.id.toString()}`)
    }

    await this.dumpRepository.removeDump(dto.filePath)

    return Result.ok()
  }
}
