import { TimerInterface } from '@standardnotes/time'
import { VaultInviteFactoryInterface } from './VaultInviteFactoryInterface'
import { VaultInviteHash } from './VaultInviteHash'
import { VaultInvite } from '../Model/VaultInvite'

export class VaultInviteFactory implements VaultInviteFactoryInterface {
  constructor(private timer: TimerInterface) {}

  create(dto: VaultInviteHash): VaultInvite {
    const newVaultInvite = new VaultInvite()
    newVaultInvite.uuid = dto.uuid
    newVaultInvite.userUuid = dto.user_uuid
    newVaultInvite.vaultUuid = dto.vault_uuid
    newVaultInvite.inviterUuid = dto.inviter_uuid
    newVaultInvite.inviterPublicKey = dto.inviter_public_key
    newVaultInvite.encryptedVaultData = dto.encrypted_vault_data
    newVaultInvite.inviteType = dto.invite_type
    newVaultInvite.permissions = dto.permissions

    const now = this.timer.getTimestampInMicroseconds()
    newVaultInvite.updatedAtTimestamp = now
    newVaultInvite.createdAtTimestamp = now

    if (dto.created_at_timestamp) {
      newVaultInvite.createdAtTimestamp = dto.created_at_timestamp
    }

    return newVaultInvite
  }

  createStub(dto: VaultInviteHash): VaultInvite {
    const item = this.create(dto)
    return item
  }
}
