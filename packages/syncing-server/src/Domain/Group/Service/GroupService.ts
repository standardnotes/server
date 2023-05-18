import { v4 as uuidv4 } from 'uuid'
import { TimerInterface } from '@standardnotes/time'

import { Group } from '../Model/Group'
import { GroupsRepositoryInterface } from '../Repository/GroupRepositoryInterface'
import { GroupServiceInterface } from './GroupServiceInterface'
import { GroupFactoryInterface } from '../Factory/GroupFactoryInterface'

export class GroupService implements GroupServiceInterface {
  constructor(
    private groupRepository: GroupsRepositoryInterface,
    private groupFactory: GroupFactoryInterface,
    private timer: TimerInterface,
  ) {}

  async createGroup(dto: {
    userUuid: string
    encryptedGroupKey: string
    creatorPublicKey: string
  }): Promise<Group | null> {
    const group = this.groupFactory.create({
      userUuid: dto.userUuid,
      groupHash: {
        uuid: uuidv4(),
        user_uuid: dto.userUuid,
        created_at_timestamp: this.timer.getTimestampInSeconds(),
        updated_at_timestamp: this.timer.getTimestampInSeconds(),
      },
    })

    const savedGroup = await this.groupRepository.create(group)

    return savedGroup
  }

  async deleteGroup(dto: { groupUuid: string; originatorUuid: string }): Promise<boolean> {
    const group = await this.groupRepository.findByUuid(dto.groupUuid)
    if (!group || group.userUuid !== dto.originatorUuid) {
      return false
    }

    await this.groupRepository.remove(group)

    return true
  }
}
