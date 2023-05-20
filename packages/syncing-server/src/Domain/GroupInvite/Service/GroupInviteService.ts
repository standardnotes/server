import { TimerInterface } from '@standardnotes/time'
import { GroupInvite } from '../Model/GroupInvite'
import { GroupInviteFactoryInterface } from '../Factory/GroupInviteFactoryInterface'
import { v4 as uuidv4 } from 'uuid'
import { GroupInviteRepositoryInterface } from '../Repository/GroupInviteRepositoryInterface'
import { GroupInviteServiceInterface } from './GroupInviteServiceInterface'
import { GetUserGroupInvitesDTO } from './GetUserGroupInvitesDTO'
import { GroupsRepositoryInterface } from '../../Group/Repository/GroupRepositoryInterface'
import { GroupUserServiceInterface } from '../../GroupUser/Service/GroupUserServiceInterface'
import { GroupInviteType } from '../Model/GroupInviteType'

export class GroupInviteService implements GroupInviteServiceInterface {
  constructor(
    private groupRepository: GroupsRepositoryInterface,
    private groupInviteRepository: GroupInviteRepositoryInterface,
    private groupInviteFactory: GroupInviteFactoryInterface,
    private groupUserService: GroupUserServiceInterface,
    private timer: TimerInterface,
  ) {}

  async createGroupInvite(dto: {
    originatorUuid: string
    groupUuid: string
    userUuid: string
    inviterPublicKey: string
    encryptedGroupKey: string
    inviteType: GroupInviteType
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
      inviter_uuid: dto.originatorUuid,
      inviter_public_key: dto.inviterPublicKey,
      encrypted_group_key: dto.encryptedGroupKey,
      invite_type: dto.inviteType,
      permissions: dto.permissions,
      created_at_timestamp: this.timer.getTimestampInSeconds(),
      updated_at_timestamp: this.timer.getTimestampInSeconds(),
    })

    return this.groupInviteRepository.create(groupInvite)
  }

  getGroupInvitesForUser(dto: GetUserGroupInvitesDTO): Promise<GroupInvite[]> {
    return this.groupInviteRepository.findAllForUser(dto)
  }

  async getGroupInvitesForGroup(dto: {
    groupUuid: string
    originatorUuid: string
  }): Promise<GroupInvite[] | undefined> {
    const group = await this.groupRepository.findByUuid(dto.groupUuid)
    if (!group) {
      return undefined
    }

    const isUserGroupAdmin = group && group.userUuid === dto.originatorUuid
    if (!isUserGroupAdmin) {
      return undefined
    }

    const users = await this.groupInviteRepository.findAllForGroup({ groupUuid: dto.groupUuid })

    return users
  }

  async acceptGroupInvite(dto: { originatorUuid: string; inviteUuid: string }): Promise<boolean> {
    const invite = await this.groupInviteRepository.findByUuid(dto.inviteUuid)
    if (!invite) {
      return false
    }

    const isAuthorized = invite.userUuid === dto.originatorUuid
    if (!isAuthorized) {
      return false
    }

    if (invite.inviteType === GroupInviteType.Join) {
      const addedUser = await this.groupUserService.addGroupUser({
        userUuid: dto.originatorUuid,
        groupUuid: invite.groupUuid,
        permissions: invite.permissions,
      })

      if (!addedUser) {
        return false
      }
    }

    await this.groupInviteRepository.remove(invite)

    return true
  }

  async declineGroupInvite(dto: { originatorUuid: string; inviteUuid: string }): Promise<boolean> {
    const invite = await this.groupInviteRepository.findByUuid(dto.inviteUuid)
    if (!invite) {
      return false
    }

    const isAuthorized = invite.userUuid === dto.originatorUuid
    if (!isAuthorized) {
      return false
    }

    await this.groupInviteRepository.remove(invite)

    return true
  }

  async deleteGroupInvite(dto: { originatorUuid: string; inviteUuid: string }): Promise<boolean> {
    const invite = await this.groupInviteRepository.findByUuid(dto.inviteUuid)
    if (!invite) {
      return false
    }

    const isAuthorized = invite.inviterUuid === dto.originatorUuid || invite.userUuid === dto.originatorUuid
    if (!isAuthorized) {
      return false
    }

    await this.groupInviteRepository.remove(invite)

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
