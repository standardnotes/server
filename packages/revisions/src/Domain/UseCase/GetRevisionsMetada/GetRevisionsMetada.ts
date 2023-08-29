import { Result, RoleNameCollection, UseCaseInterface, Uuid } from '@standardnotes/domain-core'

import { RevisionMetadata } from '../../Revision/RevisionMetadata'

import { GetRevisionsMetadaDTO } from './GetRevisionsMetadaDTO'
import { RevisionRepositoryResolverInterface } from '../../Revision/RevisionRepositoryResolverInterface'

export class GetRevisionsMetada implements UseCaseInterface<RevisionMetadata[]> {
  constructor(private revisionRepositoryResolver: RevisionRepositoryResolverInterface) {}

  async execute(dto: GetRevisionsMetadaDTO): Promise<Result<RevisionMetadata[]>> {
    const itemUuidOrError = Uuid.create(dto.itemUuid)
    if (itemUuidOrError.isFailed()) {
      return Result.fail<RevisionMetadata[]>(`Could not get revisions: ${itemUuidOrError.getError()}`)
    }

    const userUuidOrError = Uuid.create(dto.userUuid)
    if (userUuidOrError.isFailed()) {
      return Result.fail<RevisionMetadata[]>(`Could not get revisions: ${userUuidOrError.getError()}`)
    }

    const roleNamesOrError = RoleNameCollection.create(dto.roleNames)
    if (roleNamesOrError.isFailed()) {
      return Result.fail(roleNamesOrError.getError())
    }
    const roleNames = roleNamesOrError.getValue()

    const revisionRepository = this.revisionRepositoryResolver.resolve(roleNames)

    const revisionsMetdata = await revisionRepository.findMetadataByItemId(
      itemUuidOrError.getValue(),
      userUuidOrError.getValue(),
    )

    return Result.ok<RevisionMetadata[]>(revisionsMetdata)
  }
}
