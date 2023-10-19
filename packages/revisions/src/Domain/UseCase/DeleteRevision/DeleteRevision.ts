import { Result, UseCaseInterface, Uuid } from '@standardnotes/domain-core'

import { DeleteRevisionDTO } from './DeleteRevisionDTO'
import { RevisionRepositoryInterface } from '../../Revision/RevisionRepositoryInterface'

export class DeleteRevision implements UseCaseInterface<string> {
  constructor(private revisionRepository: RevisionRepositoryInterface) {}

  async execute(dto: DeleteRevisionDTO): Promise<Result<string>> {
    const revisionUuidOrError = Uuid.create(dto.revisionUuid)
    if (revisionUuidOrError.isFailed()) {
      return Result.fail<string>(`Could not delete revision: ${revisionUuidOrError.getError()}`)
    }
    const revisionUuid = revisionUuidOrError.getValue()

    const userUuidOrError = Uuid.create(dto.userUuid)
    if (userUuidOrError.isFailed()) {
      return Result.fail<string>(`Could not delete revision: ${userUuidOrError.getError()}`)
    }
    const userUuid = userUuidOrError.getValue()

    await this.revisionRepository.removeOneByUuid(revisionUuid, userUuid)

    return Result.ok<string>('Revision removed')
  }
}
