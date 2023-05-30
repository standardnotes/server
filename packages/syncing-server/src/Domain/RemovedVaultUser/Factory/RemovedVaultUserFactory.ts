import { TimerInterface } from '@standardnotes/time'
import { RemovedVaultUserFactoryInterface } from './RemovedVaultUserFactoryInterface'
import { RemovedVaultUserHash } from './RemovedVaultUserHash'
import { RemovedVaultUser } from '../Model/RemovedVaultUser'

export class RemovedVaultUserFactory implements RemovedVaultUserFactoryInterface {
  constructor(private timer: TimerInterface) {}

  create(dto: RemovedVaultUserHash): RemovedVaultUser {
    const newRemovedVaultUser = new RemovedVaultUser()
    newRemovedVaultUser.uuid = dto.uuid
    newRemovedVaultUser.userUuid = dto.user_uuid
    newRemovedVaultUser.vaultUuid = dto.vault_uuid
    newRemovedVaultUser.removedBy = dto.removed_by

    const now = this.timer.getTimestampInMicroseconds()
    newRemovedVaultUser.updatedAtTimestamp = now
    newRemovedVaultUser.createdAtTimestamp = now

    if (dto.created_at_timestamp) {
      newRemovedVaultUser.createdAtTimestamp = dto.created_at_timestamp
    }

    return newRemovedVaultUser
  }

  createStub(dto: RemovedVaultUserHash): RemovedVaultUser {
    const item = this.create(dto)
    return item
  }
}
