import { TimerInterface } from '@standardnotes/time'
import { SharedVaultUserFactoryInterface } from './SharedVaultUserFactoryInterface'
import { SharedVaultUserHash } from './SharedVaultUserHash'
import { SharedVaultUser } from '../Model/SharedVaultUser'

export class SharedVaultUserFactory implements SharedVaultUserFactoryInterface {
  constructor(private timer: TimerInterface) {}

  create(dto: SharedVaultUserHash): SharedVaultUser {
    const newSharedVaultUser = new SharedVaultUser()
    newSharedVaultUser.uuid = dto.uuid
    newSharedVaultUser.userUuid = dto.user_uuid
    newSharedVaultUser.sharedVaultUuid = dto.shared_vault_uuid
    newSharedVaultUser.permissions = dto.permissions

    const now = this.timer.getTimestampInMicroseconds()
    newSharedVaultUser.updatedAtTimestamp = now
    newSharedVaultUser.createdAtTimestamp = now

    if (dto.created_at_timestamp) {
      newSharedVaultUser.createdAtTimestamp = dto.created_at_timestamp
    }

    return newSharedVaultUser
  }

  createStub(dto: SharedVaultUserHash): SharedVaultUser {
    const item = this.create(dto)
    return item
  }
}
