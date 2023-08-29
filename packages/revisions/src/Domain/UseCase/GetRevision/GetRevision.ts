import { Result, RoleNameCollection, UseCaseInterface, Uuid } from '@standardnotes/domain-core'

import { Revision } from '../../Revision/Revision'
import { GetRevisionDTO } from './GetRevisionDTO'
import { RevisionRepositoryResolverInterface } from '../../Revision/RevisionRepositoryResolverInterface'

export class GetRevision implements UseCaseInterface<Revision> {
  constructor(private revisionRepositoryResolver: RevisionRepositoryResolverInterface) {}

  async execute(dto: GetRevisionDTO): Promise<Result<Revision>> {
    const revisionUuidOrError = Uuid.create(dto.revisionUuid)
    if (revisionUuidOrError.isFailed()) {
      return Result.fail<Revision>(`Could not get revision: ${revisionUuidOrError.getError()}`)
    }
    const revisionUuid = revisionUuidOrError.getValue()

    const userUuidOrError = Uuid.create(dto.userUuid)
    if (userUuidOrError.isFailed()) {
      return Result.fail<Revision>(`Could not get revision: ${userUuidOrError.getError()}`)
    }
    const userUuid = userUuidOrError.getValue()

    const roleNamesOrError = RoleNameCollection.create(dto.roleNames)
    if (roleNamesOrError.isFailed()) {
      return Result.fail(roleNamesOrError.getError())
    }
    const roleNames = roleNamesOrError.getValue()

    const revisionRepository = this.revisionRepositoryResolver.resolve(roleNames)

    const revision = await revisionRepository.findOneByUuid(revisionUuid, userUuid)

    if (revision === null) {
      return Result.fail<Revision>(`Could not find revision with uuid: ${revisionUuid.value}`)
    }

    return Result.ok<Revision>(revision)
  }
}
