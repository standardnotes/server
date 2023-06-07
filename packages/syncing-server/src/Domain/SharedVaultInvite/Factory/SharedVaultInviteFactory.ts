import { TimerInterface } from '@standardnotes/time'
import { SharedVaultInviteFactoryInterface } from './SharedVaultInviteFactoryInterface'
import { SharedVaultInviteHash } from './SharedVaultInviteHash'
import { SharedVaultInvite } from '../Model/SharedVaultInvite'

export class SharedVaultInviteFactory implements SharedVaultInviteFactoryInterface {
  constructor(private timer: TimerInterface) {}

  create(dto: SharedVaultInviteHash): SharedVaultInvite {
    const newSharedVaultInvite = new SharedVaultInvite()
    newSharedVaultInvite.uuid = dto.uuid
    newSharedVaultInvite.userUuid = dto.user_uuid
    newSharedVaultInvite.sharedVaultUuid = dto.shared_vault_uuid
    newSharedVaultInvite.senderUuid = dto.sender_uuid
    newSharedVaultInvite.senderPublicKey = dto.sender_public_key
    newSharedVaultInvite.encryptedMessage = dto.encrypted_message
    newSharedVaultInvite.permissions = dto.permissions

    const now = this.timer.getTimestampInMicroseconds()
    newSharedVaultInvite.updatedAtTimestamp = now
    newSharedVaultInvite.createdAtTimestamp = now

    if (dto.created_at_timestamp) {
      newSharedVaultInvite.createdAtTimestamp = dto.created_at_timestamp
    }

    return newSharedVaultInvite
  }

  createStub(dto: SharedVaultInviteHash): SharedVaultInvite {
    const item = this.create(dto)
    return item
  }
}
