import { Result, UseCaseInterface, Uuid } from '@standardnotes/domain-core'

import { Revision } from '../../Revision/Revision'

import { CopyRevisionsDTO } from './CopyRevisionsDTO'
import { RevisionRepositoryInterface } from '../../Revision/RevisionRepositoryInterface'

export class CopyRevisions implements UseCaseInterface<string> {
  constructor(private revisionRepository: RevisionRepositoryInterface) {}

  async execute(dto: CopyRevisionsDTO): Promise<Result<string>> {
    const orignalItemUuidOrError = Uuid.create(dto.originalItemUuid)
    if (orignalItemUuidOrError.isFailed()) {
      return Result.fail<string>(`Could not copy revisions: ${orignalItemUuidOrError.getError()}`)
    }
    const originalItemUuid = orignalItemUuidOrError.getValue()

    const newItemUuidOrError = Uuid.create(dto.newItemUuid)
    if (newItemUuidOrError.isFailed()) {
      return Result.fail<string>(`Could not copy revisions: ${newItemUuidOrError.getError()}`)
    }
    const newItemUuid = newItemUuidOrError.getValue()

    const revisions = await this.revisionRepository.findByItemUuid(originalItemUuid)

    for (const existingRevision of revisions) {
      const revisionCopyOrError = Revision.create({
        ...existingRevision.props,
        itemUuid: newItemUuid,
      })

      if (revisionCopyOrError.isFailed()) {
        return Result.fail<string>(`Could not create revision copy: ${revisionCopyOrError.getError()}`)
      }

      const revisionCopy = revisionCopyOrError.getValue()

      await this.revisionRepository.insert(revisionCopy)
    }

    return Result.ok<string>('Revisions copied')
  }
}
