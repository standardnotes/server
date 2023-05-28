import { VaultInvite } from '../Domain/VaultInvite/Model/VaultInvite'
import { ProjectorInterface } from './ProjectorInterface'
import { VaultInviteProjection } from './VaultInviteProjection'

export class VaultInviteProjector implements ProjectorInterface<VaultInvite, VaultInviteProjection> {
  projectSimple(_vaultInvite: VaultInvite): VaultInviteProjection {
    throw Error('not implemented')
  }

  projectCustom(_projectionType: string, vaultInvite: VaultInvite): VaultInviteProjection {
    const fullProjection = this.projectFull(vaultInvite)

    return {
      ...fullProjection,
      user_uuid: vaultInvite.userUuid,
    }
  }

  projectFull(vaultInvite: VaultInvite): VaultInviteProjection {
    return {
      uuid: vaultInvite.uuid,
      vault_uuid: vaultInvite.vaultUuid,
      user_uuid: vaultInvite.userUuid,
      inviter_uuid: vaultInvite.inviterUuid,
      inviter_public_key: vaultInvite.inviterPublicKey,
      encrypted_vault_data: vaultInvite.encryptedVaultData,
      invite_type: vaultInvite.inviteType,
      permissions: vaultInvite.permissions,
      created_at_timestamp: vaultInvite.createdAtTimestamp,
      updated_at_timestamp: vaultInvite.updatedAtTimestamp,
    }
  }
}
