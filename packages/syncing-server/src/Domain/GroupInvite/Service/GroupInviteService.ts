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
import { CreateInviteDTO } from './CreateInviteDTO'
import { UpdateInviteDTO } from './UpdateInviteDTO'

export class GroupInviteService implements GroupInviteServiceInterface {
  constructor(
    private groupRepository: GroupsRepositoryInterface,
    private groupInviteRepository: GroupInviteRepositoryInterface,
    private groupInviteFactory: GroupInviteFactoryInterface,
    private groupUserService: GroupUserServiceInterface,
    private timer: TimerInterface,
  ) {}

  async createInvite(dto: CreateInviteDTO): Promise<GroupInvite | null> {
    const group = await this.groupRepository.findByUuid(dto.groupUuid)
    if (!group || group.userUuid !== dto.originatorUuid) {
      return null
    }

    const timestamp = this.timer.getTimestampInMicroseconds()

    const groupInvite = this.groupInviteFactory.create({
      uuid: uuidv4(),
      user_uuid: dto.userUuid,
      group_uuid: dto.groupUuid,
      inviter_uuid: dto.originatorUuid,
      inviter_public_key: dto.inviterPublicKey,
      encrypted_group_data: dto.encryptedGroupData,
      invite_type: dto.inviteType,
      permissions: dto.permissions,
      created_at_timestamp: timestamp,
      updated_at_timestamp: timestamp,
    })

    return this.groupInviteRepository.create(groupInvite)
  }

  async updateInvite(dto: UpdateInviteDTO): Promise<GroupInvite | null> {
    const groupInvite = await this.groupInviteRepository.findByUuid(dto.inviteUuid)
    if (!groupInvite || groupInvite.inviterUuid !== dto.originatorUuid) {
      return null
    }

    groupInvite.inviterPublicKey = dto.inviterPublicKey
    groupInvite.encryptedGroupData = dto.encryptedGroupData
    if (dto.permissions) {
      groupInvite.permissions = dto.permissions
    }
    groupInvite.updatedAtTimestamp = this.timer.getTimestampInMicroseconds()

    return this.groupInviteRepository.save(groupInvite)
  }

  getInvitesForUser(dto: GetUserGroupInvitesDTO): Promise<GroupInvite[]> {
    return this.groupInviteRepository.findAll(dto)
  }

  getOutboundInvitesForUser(dto: { userUuid: string }): Promise<GroupInvite[]> {
    return this.groupInviteRepository.findAll({
      inviterUuid: dto.userUuid,
    })
  }

  async deleteAllInboundInvites(dto: { userUuid: string }): Promise<void> {
    const inboundInvites = await this.groupInviteRepository.findAll({
      userUuid: dto.userUuid,
    })

    for (const invite of inboundInvites) {
      await this.groupInviteRepository.remove(invite)
    }
  }

  async getInvitesForGroup(dto: { groupUuid: string; originatorUuid: string }): Promise<GroupInvite[] | undefined> {
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

  async acceptInvite(dto: { originatorUuid: string; inviteUuid: string }): Promise<boolean> {
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

  async declineInvite(dto: { originatorUuid: string; inviteUuid: string }): Promise<boolean> {
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

  async deleteInvite(dto: { originatorUuid: string; inviteUuid: string }): Promise<boolean> {
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

  async deleteAllInvitesForGroup(dto: { originatorUuid: string; groupUuid: string }): Promise<boolean> {
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
