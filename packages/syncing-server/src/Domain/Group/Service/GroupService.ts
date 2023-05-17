import { GroupUserKey } from '../../GroupUserKey/Model/GroupUserKey'
import { Group } from '../Model/Group'

import { GroupsRepositoryInterface } from '../Repository/GroupRepositoryInterface'
import { GroupServiceInterface } from './GroupServiceInterface'

import { GroupFactoryInterface } from '../Factory/GroupFactoryInterface'
import { TimerInterface } from '@standardnotes/time'
import { GroupUserKeyServiceInterface } from '../../GroupUserKey/Service/GroupUserKeyServiceInterface'

import { v4 as uuidv4 } from 'uuid'

export class GroupService implements GroupServiceInterface {
  constructor(
    private groupRepository: GroupsRepositoryInterface,
    private groupFactory: GroupFactoryInterface,
    private groupUserService: GroupUserKeyServiceInterface,
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

  async addUserToGroup(dto: {
    groupUuid: string
    ownerUuid: string
    inviteeUuid: string
    encryptedGroupKey: string
    senderPublicKey: string
    permissions: string
  }): Promise<GroupUserKey | null> {
    const group = await this.groupRepository.findByUuid(dto.groupUuid)
    if (!group || group.userUuid !== dto.ownerUuid) {
      return null
    }

    const user = await this.groupUserService.createGroupUserKey({
      groupUuid: dto.groupUuid,
      userUuid: dto.inviteeUuid,
      encryptedGroupKey: dto.encryptedGroupKey,
      senderPublicKey: dto.senderPublicKey,
      permissions: dto.permissions,
    })

    return user
  }
}
