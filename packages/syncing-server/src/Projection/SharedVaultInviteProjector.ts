import { SharedVaultInvite } from '../Domain/SharedVaultInvite/Model/SharedVaultInvite'
import { ProjectorInterface } from './ProjectorInterface'
import { SharedVaultInviteProjection } from './SharedVaultInviteProjection'

export class SharedVaultInviteProjector implements ProjectorInterface<SharedVaultInvite, SharedVaultInviteProjection> {
  projectSimple(_sharedVaultInvite: SharedVaultInvite): SharedVaultInviteProjection {
    throw Error('not implemented')
  }

  projectCustom(_projectionType: string, sharedVaultInvite: SharedVaultInvite): SharedVaultInviteProjection {
    const fullProjection = this.projectFull(sharedVaultInvite)

    return {
      ...fullProjection,
      user_uuid: sharedVaultInvite.userUuid,
    }
  }

  projectFull(sharedVaultInvite: SharedVaultInvite): SharedVaultInviteProjection {
    return {
      uuid: sharedVaultInvite.uuid,
      shared_vault_uuid: sharedVaultInvite.sharedVaultUuid,
      user_uuid: sharedVaultInvite.userUuid,
      sender_uuid: sharedVaultInvite.senderUuid,
      encrypted_message: sharedVaultInvite.encryptedMessage,
      permissions: sharedVaultInvite.permissions,
      created_at_timestamp: sharedVaultInvite.createdAtTimestamp,
      updated_at_timestamp: sharedVaultInvite.updatedAtTimestamp,
    }
  }
}
