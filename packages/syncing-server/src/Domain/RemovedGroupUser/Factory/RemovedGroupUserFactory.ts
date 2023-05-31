import { TimerInterface } from '@standardnotes/time'
import { RemovedGroupUserFactoryInterface } from './RemovedGroupUserFactoryInterface'
import { RemovedGroupUserHash } from './RemovedGroupUserHash'
import { RemovedGroupUser } from '../Model/RemovedGroupUser'

export class RemovedGroupUserFactory implements RemovedGroupUserFactoryInterface {
  constructor(private timer: TimerInterface) {}

  create(dto: RemovedGroupUserHash): RemovedGroupUser {
    const newRemovedGroupUser = new RemovedGroupUser()
    newRemovedGroupUser.uuid = dto.uuid
    newRemovedGroupUser.userUuid = dto.user_uuid
    newRemovedGroupUser.groupUuid = dto.group_uuid
    newRemovedGroupUser.removedBy = dto.removed_by

    const now = this.timer.getTimestampInMicroseconds()
    newRemovedGroupUser.updatedAtTimestamp = now
    newRemovedGroupUser.createdAtTimestamp = now

    if (dto.created_at_timestamp) {
      newRemovedGroupUser.createdAtTimestamp = dto.created_at_timestamp
    }

    return newRemovedGroupUser
  }

  createStub(dto: RemovedGroupUserHash): RemovedGroupUser {
    const item = this.create(dto)
    return item
  }
}
