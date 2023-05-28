import { TimerInterface } from '@standardnotes/time'
import { VaultUserFactoryInterface } from './VaultUserFactoryInterface'
import { VaultUserHash } from './VaultUserHash'
import { VaultUser } from '../Model/VaultUser'

export class VaultUserFactory implements VaultUserFactoryInterface {
  constructor(private timer: TimerInterface) {}

  create(dto: VaultUserHash): VaultUser {
    const newVaultUser = new VaultUser()
    newVaultUser.uuid = dto.uuid
    newVaultUser.userUuid = dto.user_uuid
    newVaultUser.vaultUuid = dto.vault_uuid
    newVaultUser.permissions = dto.permissions

    const now = this.timer.getTimestampInMicroseconds()
    newVaultUser.updatedAtTimestamp = now
    newVaultUser.createdAtTimestamp = now

    if (dto.created_at_timestamp) {
      newVaultUser.createdAtTimestamp = dto.created_at_timestamp
    }

    return newVaultUser
  }

  createStub(dto: VaultUserHash): VaultUser {
    const item = this.create(dto)
    return item
  }
}
