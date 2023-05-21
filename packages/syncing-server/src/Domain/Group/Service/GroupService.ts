import { v4 as uuidv4 } from 'uuid'
import { TimerInterface } from '@standardnotes/time'

import { Group } from '../Model/Group'
import { GroupsRepositoryInterface } from '../Repository/GroupRepositoryInterface'
import { GroupServiceInterface } from './GroupServiceInterface'
import { GroupFactoryInterface } from '../Factory/GroupFactoryInterface'
import { GroupUserServiceInterface } from '../../GroupUser/Service/GroupUserServiceInterface'
import { GroupInviteServiceInterface } from '../../GroupInvite/Service/GroupInviteServiceInterface'

export class GroupService implements GroupServiceInterface {
  constructor(
    private groupRepository: GroupsRepositoryInterface,
    private groupFactory: GroupFactoryInterface,
    private groupUserService: GroupUserServiceInterface,
    private groupInviteService: GroupInviteServiceInterface,
    private timer: TimerInterface,
  ) {}

  async createGroup(dto: { userUuid: string; specifiedItemsKeyUuid: string }): Promise<Group | null> {
    const group = this.groupFactory.create({
      userUuid: dto.userUuid,
      groupHash: {
        uuid: uuidv4(),
        user_uuid: dto.userUuid,
        specified_items_key_uuid: dto.specifiedItemsKeyUuid,
        created_at_timestamp: this.timer.getTimestampInMicroseconds(),
        updated_at_timestamp: this.timer.getTimestampInMicroseconds(),
      },
    })

    const savedGroup = await this.groupRepository.create(group)

    return savedGroup
  }

  async getGroup(dto: { groupUuid: string }): Promise<Group | null> {
    const group = await this.groupRepository.findByUuid(dto.groupUuid)

    return group
  }

  getGroups(dto: { userUuid: string; lastSyncTime?: number }): Promise<Group[]> {
    return this.groupRepository.findAll({ userUuid: dto.userUuid, lastSyncTime: dto.lastSyncTime })
  }

  async updateGroup(dto: {
    groupUuid: string
    originatorUuid: string
    specifiedItemsKeyUuid: string
  }): Promise<Group | null> {
    const group = await this.groupRepository.findByUuid(dto.groupUuid)
    if (!group || group.userUuid !== dto.originatorUuid) {
      return null
    }

    group.specifiedItemsKeyUuid = dto.specifiedItemsKeyUuid
    group.updatedAtTimestamp = this.timer.getTimestampInMicroseconds()

    const savedGroup = await this.groupRepository.save(group)

    return savedGroup
  }

  async deleteGroup(dto: { groupUuid: string; originatorUuid: string }): Promise<boolean> {
    const group = await this.groupRepository.findByUuid(dto.groupUuid)
    if (!group || group.userUuid !== dto.originatorUuid) {
      return false
    }

    await this.groupRepository.remove(group)
    await this.groupUserService.deleteAllGroupUsersForGroup({
      groupUuid: dto.groupUuid,
      originatorUuid: dto.originatorUuid,
    })
    await this.groupInviteService.deleteAllInvitesForGroup({
      groupUuid: dto.groupUuid,
      originatorUuid: dto.originatorUuid,
    })

    return true
  }
}
