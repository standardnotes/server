import { Result, UseCaseInterface, Uuid } from '@standardnotes/domain-core'

import { RemoveRevisionsFromSharedVaultDTO } from './RemoveRevisionsFromSharedVaultDTO'
import { RevisionRepositoryInterface } from '../../Revision/RevisionRepositoryInterface'

export class RemoveRevisionsFromSharedVault implements UseCaseInterface<void> {
  constructor(private revisionRepository: RevisionRepositoryInterface) {}

  async execute(dto: RemoveRevisionsFromSharedVaultDTO): Promise<Result<void>> {
    const sharedVaultUuidOrError = Uuid.create(dto.sharedVaultUuid)
    if (sharedVaultUuidOrError.isFailed()) {
      return Result.fail(sharedVaultUuidOrError.getError())
    }
    const sharedVaultUuid = sharedVaultUuidOrError.getValue()

    let itemUuid: Uuid | undefined
    if (dto.itemUuid !== undefined) {
      const itemUuidOrError = Uuid.create(dto.itemUuid)
      if (itemUuidOrError.isFailed()) {
        return Result.fail(itemUuidOrError.getError())
      }
      itemUuid = itemUuidOrError.getValue()
    }

    await this.revisionRepository.clearSharedVaultAndKeySystemAssociations({
      itemUuid,
      sharedVaultUuid,
    })

    return Result.ok()
  }
}
