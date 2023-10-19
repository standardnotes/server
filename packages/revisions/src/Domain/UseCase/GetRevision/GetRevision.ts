import { Result, UseCaseInterface, Uuid } from '@standardnotes/domain-core'

import { Revision } from '../../Revision/Revision'
import { GetRevisionDTO } from './GetRevisionDTO'
import { RevisionRepositoryInterface } from '../../Revision/RevisionRepositoryInterface'

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
      return Result.fail<Revision>(`Could not get revision: ${userUuidOrError.getError()}`)
    }
    const userUuid = userUuidOrError.getValue()

    const sharedVaultUuids = []
    for (const sharedVaultUuid of dto.sharedVaultUuids) {
      const sharedVaultUuidOrError = Uuid.create(sharedVaultUuid)
      if (sharedVaultUuidOrError.isFailed()) {
        return Result.fail(`Could not get revision: ${sharedVaultUuidOrError.getError()}`)
      }
      sharedVaultUuids.push(sharedVaultUuidOrError.getValue())
    }

    const revision = await this.revisionRepository.findOneByUuid(revisionUuid, userUuid, sharedVaultUuids)

    if (revision === null) {
      return Result.fail<Revision>(`Could not find revision with uuid: ${revisionUuid.value}`)
    }

    return Result.ok<Revision>(revision)
  }
}
