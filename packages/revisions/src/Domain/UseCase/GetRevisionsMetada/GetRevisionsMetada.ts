import { Result, RevisionMetadata, UseCaseInterface, Uuid } from '@standardnotes/domain-core'

import { RevisionRepositoryInterface } from '../../Revision/RevisionRepositoryInterface'

import { GetRevisionsMetadaDTO } from './GetRevisionsMetadaDTO'

export class GetRevisionsMetada implements UseCaseInterface<RevisionMetadata[]> {
  constructor(private revisionRepository: RevisionRepositoryInterface) {}

  async execute(dto: GetRevisionsMetadaDTO): Promise<Result<RevisionMetadata[]>> {
    const itemUuidOrError = Uuid.create(dto.itemUuid)
    if (itemUuidOrError.isFailed()) {
      return Result.fail<RevisionMetadata[]>(`Could not get revisions: ${itemUuidOrError.getError()}`)
    }

    const revisionsMetdata = await this.revisionRepository.findMetadataByItemId(itemUuidOrError.getValue())

    return Result.ok<RevisionMetadata[]>(revisionsMetdata)
  }
}
