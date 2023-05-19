import { TimerInterface } from '@standardnotes/time'
import { GroupInvite } from '../Model/GroupInvite'
import { GroupInviteFactoryInterface } from '../Factory/GroupInviteFactoryInterface'
import { v4 as uuidv4 } from 'uuid'
import { GroupInviteRepositoryInterface } from '../Repository/GroupInviteRepositoryInterface'
import { GroupInviteServiceInterface } from './GroupInviteServiceInterface'
import { GetUserGroupKeysDTO } from './GetUserGroupInvitesDTO'
import { GroupsRepositoryInterface } from '../../Group/Repository/GroupRepositoryInterface'

export class GroupInviteService implements GroupInviteServiceInterface {
  constructor(
    private groupRepository: GroupsRepositoryInterface,
    private groupInviteRepository: GroupInviteRepositoryInterface,
    private groupInviteFactory: GroupInviteFactoryInterface,
    private timer: TimerInterface,
  ) {}

  async createGroupInvite(dto: {
    originatorUuid: string
    groupUuid: string
    userUuid: string
    inviterUuid: string
    permissions: string
  }): Promise<GroupInvite | null> {
    const group = await this.groupRepository.findByUuid(dto.groupUuid)
    if (!group || group.userUuid !== dto.originatorUuid) {
      return null
    }

    const groupInvite = this.groupInviteFactory.create({
      uuid: uuidv4(),
      user_uuid: dto.userUuid,
      group_uuid: dto.groupUuid,
      inviter_uuid: dto.inviterUuid,
      permissions: dto.permissions,
      created_at_timestamp: this.timer.getTimestampInSeconds(),
      updated_at_timestamp: this.timer.getTimestampInSeconds(),
    })

    return this.groupInviteRepository.create(groupInvite)
  }

  getGroupInvitesForUser(dto: GetUserGroupKeysDTO): Promise<GroupInvite[]> {
    return this.groupInviteRepository.findAllForUser(dto)
  }

  async getGroupInvites(dto: {
    groupUuid: string
    originatorUuid: string
  }): Promise<{ users: GroupInvite[]; isAdmin: boolean } | undefined> {
    const group = await this.groupRepository.findByUuid(dto.groupUuid)
    if (!group) {
      return undefined
    }

    const isUserGroupAdmin = group && group.userUuid === dto.originatorUuid
    const doesUserBelongToGroup = await this.groupInviteRepository.findByUserUuidAndGroupUuid(
      dto.originatorUuid,
      dto.groupUuid,
    )

    if (!isUserGroupAdmin && !doesUserBelongToGroup) {
      return undefined
    }

    const users = await this.groupInviteRepository.findAllForGroup({ groupUuid: dto.groupUuid })

    return {
      users,
      isAdmin: isUserGroupAdmin,
    }
  }

  async deleteGroupInvite(dto: { originatorUuid: string; groupUuid: string; userUuid: string }): Promise<boolean> {
    const groupInvite = await this.groupInviteRepository.findByUserUuidAndGroupUuid(dto.userUuid, dto.groupUuid)
    if (!groupInvite) {
      return false
    }

    const isAuthorized = groupInvite.inviterUuid !== dto.originatorUuid && groupInvite.userUuid !== dto.originatorUuid
    if (isAuthorized) {
      return false
    }

    await this.groupInviteRepository.remove(groupInvite)

    return true
  }

  async deleteAllGroupInvitesForGroup(dto: { originatorUuid: string; groupUuid: string }): Promise<boolean> {
    const group = await this.groupRepository.findByUuid(dto.groupUuid)
    if (!group || group.userUuid !== dto.originatorUuid) {
      return false
    }

    const groupInvites = await this.groupInviteRepository.findAllForGroup({ groupUuid: dto.groupUuid })
    for (const groupInvite of groupInvites) {
      await this.groupInviteRepository.remove(groupInvite)
    }

    return true
  }
}
