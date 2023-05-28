import { VaultUser } from '../Domain/VaultUser/Model/VaultUser'
import { ProjectorInterface } from './ProjectorInterface'
import { VaultUserProjection, VaultUserListingProjection } from './VaultUserProjection'

export class VaultUserProjector implements ProjectorInterface<VaultUser, VaultUserProjection> {
  projectSimple(_vaultUser: VaultUser): VaultUserProjection {
    throw Error('not implemented')
  }

  projectCustom(_projectionType: string, vaultUser: VaultUser): VaultUserProjection {
    const fullProjection = this.projectFull(vaultUser)

    return {
      ...fullProjection,
      user_uuid: vaultUser.userUuid,
    }
  }

  projectAsDisplayableUserForOtherVaultMembers(
    vaultUser: VaultUser,
    isRequesterVaultAdmin: boolean,
  ): VaultUserListingProjection {
    return {
      uuid: vaultUser.uuid,
      vault_uuid: vaultUser.vaultUuid,
      user_uuid: vaultUser.userUuid,
      permissions: isRequesterVaultAdmin ? vaultUser.permissions : undefined,
      created_at_timestamp: vaultUser.createdAtTimestamp,
      updated_at_timestamp: vaultUser.updatedAtTimestamp,
    }
  }

  projectFull(vaultUser: VaultUser): VaultUserProjection {
    return {
      uuid: vaultUser.uuid,
      vault_uuid: vaultUser.vaultUuid,
      user_uuid: vaultUser.userUuid,
      permissions: vaultUser.permissions,
      created_at_timestamp: vaultUser.createdAtTimestamp,
      updated_at_timestamp: vaultUser.updatedAtTimestamp,
    }
  }
}
