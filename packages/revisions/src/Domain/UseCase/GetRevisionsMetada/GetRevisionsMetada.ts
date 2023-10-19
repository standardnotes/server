import { Result, UseCaseInterface, Uuid } from '@standardnotes/domain-core'

import { RevisionMetadata } from '../../Revision/RevisionMetadata'

import { GetRevisionsMetadaDTO } from './GetRevisionsMetadaDTO'
import { RevisionRepositoryInterface } from '../../Revision/RevisionRepositoryInterface'

export class GetRevisionsMetada implements UseCaseInterface<RevisionMetadata[]> {
  constructor(private revisionRepository: RevisionRepositoryInterface) {}

  async execute(dto: GetRevisionsMetadaDTO): Promise<Result<RevisionMetadata[]>> {
    const itemUuidOrError = Uuid.create(dto.itemUuid)
    if (itemUuidOrError.isFailed()) {
      return Result.fail<RevisionMetadata[]>(`Could not get revisions: ${itemUuidOrError.getError()}`)
    }

    const userUuidOrError = Uuid.create(dto.userUuid)
    if (userUuidOrError.isFailed()) {
      return Result.fail<RevisionMetadata[]>(`Could not get revisions: ${userUuidOrError.getError()}`)
    }

    const sharedVaultUuids = []
    for (const sharedVaultUuid of dto.sharedVaultUuids) {
      const sharedVaultUuidOrError = Uuid.create(sharedVaultUuid)
      if (sharedVaultUuidOrError.isFailed()) {
        return Result.fail<RevisionMetadata[]>(`Could not get revisions: ${sharedVaultUuidOrError.getError()}`)
      }
      sharedVaultUuids.push(sharedVaultUuidOrError.getValue())
    }

    const revisionsMetdata = await this.revisionRepository.findMetadataByItemId(
      itemUuidOrError.getValue(),
      userUuidOrError.getValue(),
      sharedVaultUuids,
    )

    return Result.ok<RevisionMetadata[]>(revisionsMetdata)
  }
}
