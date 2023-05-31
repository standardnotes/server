import { TimerInterface } from '@standardnotes/time'
import { GroupInviteFactoryInterface } from './GroupInviteFactoryInterface'
import { GroupInviteHash } from './GroupInviteHash'
import { GroupInvite } from '../Model/GroupInvite'

export class GroupInviteFactory implements GroupInviteFactoryInterface {
  constructor(private timer: TimerInterface) {}

  create(dto: GroupInviteHash): GroupInvite {
    const newGroupInvite = new GroupInvite()
    newGroupInvite.uuid = dto.uuid
    newGroupInvite.userUuid = dto.user_uuid
    newGroupInvite.groupUuid = dto.group_uuid
    newGroupInvite.inviterUuid = dto.inviter_uuid
    newGroupInvite.inviterPublicKey = dto.inviter_public_key
    newGroupInvite.encryptedVaultKeyContent = dto.encrypted_vault_key_content
    newGroupInvite.inviteType = dto.invite_type
    newGroupInvite.permissions = dto.permissions

    const now = this.timer.getTimestampInMicroseconds()
    newGroupInvite.updatedAtTimestamp = now
    newGroupInvite.createdAtTimestamp = now

    if (dto.created_at_timestamp) {
      newGroupInvite.createdAtTimestamp = dto.created_at_timestamp
    }

    return newGroupInvite
  }

  createStub(dto: GroupInviteHash): GroupInvite {
    const item = this.create(dto)
    return item
  }
}
