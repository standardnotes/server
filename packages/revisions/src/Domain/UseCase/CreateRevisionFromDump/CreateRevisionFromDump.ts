import { Result, UseCaseInterface, Validator } from '@standardnotes/domain-core'
import { DumpRepositoryInterface } from '../../Dump/DumpRepositoryInterface'
import { CreateRevisionFromDumpDTO } from './CreateRevisionFromDumpDTO'
import { RevisionRepositoryInterface } from '../../Revision/RevisionRepositoryInterface'

export class CreateRevisionFromDump implements UseCaseInterface<void> {
  constructor(
    private dumpRepository: DumpRepositoryInterface,
    private revisionRepository: RevisionRepositoryInterface,
  ) {}

  async execute(dto: CreateRevisionFromDumpDTO): Promise<Result<void>> {
    const filePathValidationResult = Validator.isNotEmptyString(dto.filePath)
    if (filePathValidationResult.isFailed()) {
      return Result.fail(`Could not create revision from dump: ${filePathValidationResult.getError()}`)
    }

    const revisionOrError = await this.dumpRepository.getRevisionFromDumpPath(dto.filePath)
    if (revisionOrError.isFailed()) {
      await this.dumpRepository.removeDump(dto.filePath)

      return Result.fail(`Could not create revision from dump: ${revisionOrError.getError()}`)
    }
    const revision = revisionOrError.getValue()

    const successfullyInserted = await this.revisionRepository.insert(revision)
    if (!successfullyInserted) {
      await this.dumpRepository.removeDump(dto.filePath)

      return Result.fail(`Could not insert revision from dump: ${revision.id.toString()}`)
    }

    await this.dumpRepository.removeDump(dto.filePath)

    return Result.ok()
  }
}
