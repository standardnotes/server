import { TimerInterface } from '@standardnotes/time'
import { GroupUserKeyFactoryInterface } from './GroupUserKeyFactoryInterface'
import { GroupUserKeyHash } from './GroupUserKeyHash'
import { GroupUserKey } from './Model/GroupUserKey'

export class GroupUserKeyFactory implements GroupUserKeyFactoryInterface {
  constructor(private timer: TimerInterface) {}

  create(dto: GroupUserKeyHash): GroupUserKey {
    const newGroupUserKey = new GroupUserKey()
    newGroupUserKey.uuid = dto.uuid
    newGroupUserKey.userUuid = dto.user_uuid
    newGroupUserKey.senderPublicKey = dto.sender_public_key
    newGroupUserKey.encryptedGroupKey = dto.encrypted_group_key
    newGroupUserKey.groupUuid = dto.group_uuid
    newGroupUserKey.permissions = dto.permissions

    const now = this.timer.getTimestampInSeconds()
    newGroupUserKey.updatedAtTimestamp = now
    newGroupUserKey.createdAtTimestamp = now

    if (dto.created_at_timestamp) {
      newGroupUserKey.createdAtTimestamp = dto.created_at_timestamp
    }

    return newGroupUserKey
  }

  createStub(dto: GroupUserKeyHash): GroupUserKey {
    const item = this.create(dto)
    return item
  }
}
