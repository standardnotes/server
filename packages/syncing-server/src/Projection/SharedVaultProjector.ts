import { SharedVault } from '../Domain/SharedVault/Model/SharedVault'
import { ProjectorInterface } from './ProjectorInterface'
import { SharedVaultProjection } from './SharedVaultProjection'

export class SharedVaultProjector implements ProjectorInterface<SharedVault, SharedVaultProjection> {
  projectSimple(_sharedVault: SharedVault): SharedVaultProjection {
    throw Error('not implemented')
  }

  projectCustom(_projectionType: string, sharedVault: SharedVault): SharedVaultProjection {
    const fullProjection = this.projectFull(sharedVault)

    return {
      ...fullProjection,
      user_uuid: sharedVault.userUuid,
    }
  }

  projectFull(sharedVault: SharedVault): SharedVaultProjection {
    return {
      uuid: sharedVault.uuid,
      user_uuid: sharedVault.userUuid,
      file_upload_bytes_used: sharedVault.fileUploadBytesUsed,
      file_upload_bytes_limit: sharedVault.fileUploadBytesLimit,
      created_at_timestamp: sharedVault.createdAtTimestamp,
      updated_at_timestamp: sharedVault.updatedAtTimestamp,
    }
  }
}
