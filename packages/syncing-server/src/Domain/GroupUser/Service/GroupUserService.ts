import { TimerInterface } from '@standardnotes/time'
import { GroupUser } from '../Model/GroupUser'
import { GroupUserFactoryInterface } from '../Factory/GroupUserFactoryInterface'
import { v4 as uuidv4 } from 'uuid'
import { GroupUserRepositoryInterface } from '../Repository/GroupUserRepositoryInterface'
import { GroupUserServiceInterface } from './GroupUserServiceInterface'
import { GetGroupUsersDTO } from './GetGroupUsersDTO'
import { GroupsRepositoryInterface } from '../../Group/Repository/GroupRepositoryInterface'

export class GroupUserService implements GroupUserServiceInterface {
  constructor(
    private groupRepository: GroupsRepositoryInterface,
    private groupUserRepository: GroupUserRepositoryInterface,
    private groupUserFactory: GroupUserFactoryInterface,
    private timer: TimerInterface,
  ) {}

  async addGroupUser(dto: { groupUuid: string; userUuid: string; permissions: string }): Promise<GroupUser | null> {
    const group = await this.groupRepository.findByUuid(dto.groupUuid)
    if (!group) {
      return null
    }

    const groupUser = this.groupUserFactory.create({
      uuid: uuidv4(),
      user_uuid: dto.userUuid,
      group_uuid: dto.groupUuid,
      permissions: dto.permissions,
      created_at_timestamp: this.timer.getTimestampInSeconds(),
      updated_at_timestamp: this.timer.getTimestampInSeconds(),
    })

    return this.groupUserRepository.create(groupUser)
  }

  getAllGroupUsersForUser(dto: GetGroupUsersDTO): Promise<GroupUser[]> {
    return this.groupUserRepository.findAllForUser(dto)
  }

  async getGroupUsersForGroup(dto: {
    groupUuid: string
    originatorUuid: string
  }): Promise<{ users: GroupUser[]; isAdmin: boolean } | undefined> {
    const group = await this.groupRepository.findByUuid(dto.groupUuid)
    if (!group) {
      return undefined
    }

    const isUserGroupAdmin = group && group.userUuid === dto.originatorUuid
    const doesUserBelongToGroup = await this.groupUserRepository.findByUserUuidAndGroupUuid(
      dto.originatorUuid,
      dto.groupUuid,
    )

    if (!isUserGroupAdmin && !doesUserBelongToGroup) {
      return undefined
    }

    const users = await this.groupUserRepository.findAllForGroup({ groupUuid: dto.groupUuid })

    return {
      users,
      isAdmin: isUserGroupAdmin,
    }
  }

  async deleteGroupUser(dto: { originatorUuid: string; groupUuid: string; userUuid: string }): Promise<boolean> {
    const group = await this.groupRepository.findByUuid(dto.groupUuid)
    if (!group) {
      return false
    }

    const isAuthorized = group.userUuid === dto.originatorUuid
    if (!isAuthorized) {
      return false
    }

    const groupUser = await this.groupUserRepository.findByUserUuidAndGroupUuid(dto.userUuid, dto.groupUuid)
    if (!groupUser) {
      return false
    }

    await this.groupUserRepository.remove(groupUser)

    return true
  }

  async deleteAllGroupUsersForGroup(dto: { originatorUuid: string; groupUuid: string }): Promise<boolean> {
    const group = await this.groupRepository.findByUuid(dto.groupUuid)
    if (!group || group.userUuid !== dto.originatorUuid) {
      return false
    }

    const groupUsers = await this.groupUserRepository.findAllForGroup({ groupUuid: dto.groupUuid })
    for (const groupUser of groupUsers) {
      await this.groupUserRepository.remove(groupUser)
    }

    return true
  }
}
