import { Result, UseCaseInterface, Uuid } from '@standardnotes/domain-core'

import { Revision } from '../../Revision/Revision'
import { RevisionRepositoryInterface } from '../../Revision/RevisionRepositoryInterface'
import { GetRevisionDTO } from './GetRevisionDTO'

export class GetRevision implements UseCaseInterface<Revision> {
  constructor(private revisionRepository: RevisionRepositoryInterface) {}

  async execute(dto: GetRevisionDTO): Promise<Result<Revision>> {
    const revisionUuidOrError = Uuid.create(dto.revisionUuid)
    if (revisionUuidOrError.isFailed()) {
      return Result.fail<Revision>(`Could not get revision: ${revisionUuidOrError.getError()}`)
    }
    const revisionUuid = revisionUuidOrError.getValue()

    const userUuidOrError = Uuid.create(dto.userUuid)
    if (userUuidOrError.isFailed()) {
      return Result.fail<Revision>(`Could not get revisions: ${userUuidOrError.getError()}`)
    }
    const userUuid = userUuidOrError.getValue()

    const revision = await this.revisionRepository.findOneByUuid(revisionUuid, userUuid)

    if (revision === null) {
      return Result.fail<Revision>(`Could not find revision with uuid: ${revisionUuid.value}`)
    }

    return Result.ok<Revision>(revision)
  }
}
