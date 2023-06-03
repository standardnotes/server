import { TimerInterface } from '@standardnotes/time'
import { RemovedSharedVaultUserFactoryInterface } from './RemovedSharedVaultUserFactoryInterface'
import { RemovedSharedVaultUserHash } from './RemovedSharedVaultUserHash'
import { RemovedSharedVaultUser } from '../Model/RemovedSharedVaultUser'

export class RemovedSharedVaultUserFactory implements RemovedSharedVaultUserFactoryInterface {
  constructor(private timer: TimerInterface) {}

  create(dto: RemovedSharedVaultUserHash): RemovedSharedVaultUser {
    const newRemovedSharedVaultUser = new RemovedSharedVaultUser()
    newRemovedSharedVaultUser.uuid = dto.uuid
    newRemovedSharedVaultUser.userUuid = dto.user_uuid
    newRemovedSharedVaultUser.sharedVaultUuid = dto.shared_vault_uuid
    newRemovedSharedVaultUser.removedBy = dto.removed_by

    const now = this.timer.getTimestampInMicroseconds()
    newRemovedSharedVaultUser.updatedAtTimestamp = now
    newRemovedSharedVaultUser.createdAtTimestamp = now

    if (dto.created_at_timestamp) {
      newRemovedSharedVaultUser.createdAtTimestamp = dto.created_at_timestamp
    }

    return newRemovedSharedVaultUser
  }

  createStub(dto: RemovedSharedVaultUserHash): RemovedSharedVaultUser {
    const item = this.create(dto)
    return item
  }
}
