import { Result, SharedVaultUser, UseCaseInterface, Uuid } from '@standardnotes/domain-core'

import { SharedVault } from '../../../SharedVault/SharedVault'
import { GetSharedVaultsDTO } from './GetSharedVaultsDTO'
import { SharedVaultUserRepositoryInterface } from '../../../SharedVault/User/SharedVaultUserRepositoryInterface'
import { SharedVaultRepositoryInterface } from '../../../SharedVault/SharedVaultRepositoryInterface'

export class GetSharedVaults
  implements
    UseCaseInterface<{
      sharedVaults: SharedVault[]
      designatedSurvivors: SharedVaultUser[]
    }>
{
  constructor(
    private sharedVaultUserRepository: SharedVaultUserRepositoryInterface,
    private sharedVaultRepository: SharedVaultRepositoryInterface,
  ) {}

  async execute(dto: GetSharedVaultsDTO): Promise<
    Result<{
      sharedVaults: SharedVault[]
      designatedSurvivors: SharedVaultUser[]
    }>
  > {
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
      return Result.ok({
        sharedVaults: [],
        designatedSurvivors: [],
      })
    }

    const sharedVaults = await this.sharedVaultRepository.findByUuids(sharedVaultUuids, dto.lastSyncTime)

    const designatedSurvivors = []
    if (dto.includeDesignatedSurvivors) {
      for (const sharedVault of sharedVaults) {
        const designatedSurvivor = await this.sharedVaultUserRepository.findDesignatedSurvivorBySharedVaultUuid(
          sharedVault.uuid,
        )
        if (designatedSurvivor) {
          designatedSurvivors.push(designatedSurvivor)
        }
      }
    }

    return Result.ok({
      sharedVaults,
      designatedSurvivors,
    })
  }
}
