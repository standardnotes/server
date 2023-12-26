import { Result, UseCaseInterface, Uuid } from '@standardnotes/domain-core'
import { RevisionRepositoryInterface } from '../../Revision/RevisionRepositoryInterface'
import { DeleteRevisionsDTO } from './DeleteRevisionsDTO'

export class DeleteRevisions implements UseCaseInterface<void> {
  constructor(private revisionRepository: RevisionRepositoryInterface) {}

  async execute(dto: DeleteRevisionsDTO): Promise<Result<void>> {
    const itemUuidOrError = Uuid.create(dto.itemUuid)
    if (itemUuidOrError.isFailed()) {
      return Result.fail(`Could not delete revisions: ${itemUuidOrError.getError()}`)
    }
    const itemUuid = itemUuidOrError.getValue()

    await this.revisionRepository.removeByItemUuid(itemUuid)

    return Result.ok()
  }
}
