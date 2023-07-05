import { Result, UseCaseInterface, Uuid } from '@standardnotes/domain-core'

import { SharedVault } from '../../SharedVault/SharedVault'
import { GetSharedVaultsDTO } from './GetSharedVaultsDTO'
import { SharedVaultUserRepositoryInterface } from '../../SharedVault/User/SharedVaultUserRepositoryInterface'
import { SharedVaultRepositoryInterface } from '../../SharedVault/SharedVaultRepositoryInterface'

export class GetSharedVaults implements UseCaseInterface<SharedVault[]> {
  constructor(
    private sharedVaultUserRepository: SharedVaultUserRepositoryInterface,
    private sharedVaultRepository: SharedVaultRepositoryInterface,
  ) {}

  async execute(dto: GetSharedVaultsDTO): Promise<Result<SharedVault[]>> {
    const userUuidOrError = Uuid.create(dto.userUuid)
    if (userUuidOrError.isFailed()) {
      return Result.fail(userUuidOrError.getError())
    }
    const userUuid = userUuidOrError.getValue()

    const ownedSharedVaultsAssociations = await this.sharedVaultUserRepository.findByUserUuid(userUuid)

    const sharedVaultUuids = ownedSharedVaultsAssociations.map(
      (sharedVaultUser) => sharedVaultUser.props.sharedVaultUuid,
    )

    if (sharedVaultUuids.length === 0) {
      return Result.ok([])
    }

    const sharedVaults = await this.sharedVaultRepository.findByUuids(sharedVaultUuids, dto.lastSyncTime)

    return Result.ok(sharedVaults)
  }
}
