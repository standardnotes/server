import { TimerInterface } from '@standardnotes/time'
import { GroupUserFactoryInterface } from './GroupUserFactoryInterface'
import { GroupUserHash } from './GroupUserHash'
import { GroupUser } from '../Model/GroupUser'

export class GroupUserFactory implements GroupUserFactoryInterface {
  constructor(private timer: TimerInterface) {}

  create(dto: GroupUserHash): GroupUser {
    const newGroupUser = new GroupUser()
    newGroupUser.uuid = dto.uuid
    newGroupUser.userUuid = dto.user_uuid
    newGroupUser.groupUuid = dto.group_uuid
    newGroupUser.permissions = dto.permissions

    const now = this.timer.getTimestampInMicroseconds()
    newGroupUser.updatedAtTimestamp = now
    newGroupUser.createdAtTimestamp = now

    if (dto.created_at_timestamp) {
      newGroupUser.createdAtTimestamp = dto.created_at_timestamp
    }

    return newGroupUser
  }

  createStub(dto: GroupUserHash): GroupUser {
    const item = this.create(dto)
    return item
  }
}
