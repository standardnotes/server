import { SharedVaultUser } from '../Domain/SharedVaultUser/Model/SharedVaultUser'
import { ProjectorInterface } from './ProjectorInterface'
import { SharedVaultUserProjection, SharedVaultUserListingProjection } from './SharedVaultUserProjection'

export class SharedVaultUserProjector implements ProjectorInterface<SharedVaultUser, SharedVaultUserProjection> {
  projectSimple(_sharedVaultUser: SharedVaultUser): SharedVaultUserProjection {
    throw Error('not implemented')
  }

  projectCustom(_projectionType: string, sharedVaultUser: SharedVaultUser): SharedVaultUserProjection {
    const fullProjection = this.projectFull(sharedVaultUser)

    return {
      ...fullProjection,
      user_uuid: sharedVaultUser.userUuid,
    }
  }

  projectAsDisplayableUserForOtherSharedVaultMembers(
    sharedVaultUser: SharedVaultUser,
    isRequesterSharedVaultAdmin: boolean,
  ): SharedVaultUserListingProjection {
    return {
      uuid: sharedVaultUser.uuid,
      shared_vault_uuid: sharedVaultUser.sharedVaultUuid,
      user_uuid: sharedVaultUser.userUuid,
      permissions: isRequesterSharedVaultAdmin ? sharedVaultUser.permissions : undefined,
      created_at_timestamp: sharedVaultUser.createdAtTimestamp,
      updated_at_timestamp: sharedVaultUser.updatedAtTimestamp,
    }
  }

  projectFull(sharedVaultUser: SharedVaultUser): SharedVaultUserProjection {
    return {
      uuid: sharedVaultUser.uuid,
      shared_vault_uuid: sharedVaultUser.sharedVaultUuid,
      user_uuid: sharedVaultUser.userUuid,
      permissions: sharedVaultUser.permissions,
      created_at_timestamp: sharedVaultUser.createdAtTimestamp,
      updated_at_timestamp: sharedVaultUser.updatedAtTimestamp,
    }
  }
}
