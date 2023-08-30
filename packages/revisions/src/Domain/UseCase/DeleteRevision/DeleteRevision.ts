import { Result, RoleNameCollection, UseCaseInterface, Uuid } from '@standardnotes/domain-core'

import { DeleteRevisionDTO } from './DeleteRevisionDTO'
import { RevisionRepositoryResolverInterface } from '../../Revision/RevisionRepositoryResolverInterface'

export class DeleteRevision implements UseCaseInterface<string> {
  constructor(private revisionRepositoryResolver: RevisionRepositoryResolverInterface) {}

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

    const roleNamesOrError = RoleNameCollection.create(dto.roleNames)
    if (roleNamesOrError.isFailed()) {
      return Result.fail(roleNamesOrError.getError())
    }
    const roleNames = roleNamesOrError.getValue()

    const revisionRepository = this.revisionRepositoryResolver.resolve(roleNames)

    await revisionRepository.removeOneByUuid(revisionUuid, userUuid)

    return Result.ok<string>('Revision removed')
  }
}
