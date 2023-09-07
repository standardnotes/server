import { Result, RoleNameCollection, UseCaseInterface, Uuid } from '@standardnotes/domain-core'
import { RevisionRepositoryResolverInterface } from '../../Revision/RevisionRepositoryResolverInterface'
import { RemoveRevisionsFromSharedVaultDTO } from './RemoveRevisionsFromSharedVaultDTO'

export class RemoveRevisionsFromSharedVault implements UseCaseInterface<void> {
  constructor(private revisionRepositoryResolver: RevisionRepositoryResolverInterface) {}

  async execute(dto: RemoveRevisionsFromSharedVaultDTO): Promise<Result<void>> {
    const sharedVaultUuidOrError = Uuid.create(dto.sharedVaultUuid)
    if (sharedVaultUuidOrError.isFailed()) {
      return Result.fail(sharedVaultUuidOrError.getError())
    }
    const sharedVaultUuid = sharedVaultUuidOrError.getValue()

    const itemUuidOrError = Uuid.create(dto.itemUuid)
    if (itemUuidOrError.isFailed()) {
      return Result.fail(itemUuidOrError.getError())
    }
    const itemUuid = itemUuidOrError.getValue()

    const roleNamesOrError = RoleNameCollection.create(dto.roleNames)
    if (roleNamesOrError.isFailed()) {
      return Result.fail(roleNamesOrError.getError())
    }
    const roleNames = roleNamesOrError.getValue()

    const revisionRepository = this.revisionRepositoryResolver.resolve(roleNames)

    await revisionRepository.clearSharedVaultAndKeySystemAssociations(itemUuid, sharedVaultUuid)

    return Result.ok()
  }
}
