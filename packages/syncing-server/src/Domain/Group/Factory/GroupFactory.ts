import { TimerInterface } from '@standardnotes/time'
import { GroupFactoryInterface } from './GroupFactoryInterface'
import { GroupHash } from './GroupHash'
import { Group } from '../Model/Group'

export class GroupFactory implements GroupFactoryInterface {
  constructor(private timer: TimerInterface) {}

  create(dto: { userUuid: string; groupHash: GroupHash }): Group {
    const newGroup = new Group()
    newGroup.uuid = dto.groupHash.uuid
    newGroup.userUuid = dto.userUuid
    newGroup.specifiedItemsKeyUuid = dto.groupHash.specified_items_key_uuid

    const now = this.timer.getTimestampInSeconds()
    newGroup.updatedAtTimestamp = now
    newGroup.createdAtTimestamp = now

    if (dto.groupHash.created_at_timestamp) {
      newGroup.createdAtTimestamp = dto.groupHash.created_at_timestamp
    }

    return newGroup
  }

  createStub(dto: { userUuid: string; groupHash: GroupHash }): Group {
    const item = this.create(dto)
    return item
  }
}
