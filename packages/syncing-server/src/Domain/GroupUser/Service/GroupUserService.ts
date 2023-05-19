import { TimerInterface } from '@standardnotes/time'
import { GroupUser } from '../Model/GroupKey'
import { GroupUserFactoryInterface } from '../Factory/GroupUserFactoryInterface'
import { v4 as uuidv4 } from 'uuid'
import { GroupUserRepositoryInterface } from '../Repository/GroupUserRepositoryInterface'
import { GroupUserServiceInterface } from './GroupUserServiceInterface'
import { GetUserGroupKeysDTO } from './GetUserGroupUsersDTO'
import { GroupsRepositoryInterface } from '../../Group/Repository/GroupRepositoryInterface'

export class GroupUserService implements GroupUserServiceInterface {
  constructor(
    private groupRepository: GroupsRepositoryInterface,
    private groupUserRepository: GroupUserRepositoryInterface,
    private groupUserFactory: GroupUserFactoryInterface,
    private timer: TimerInterface,
  ) {}

  async createGroupUser(dto: {
    originatorUuid: string
    groupUuid: string
    userUuid: string
    senderUuid: string
    senderPublicKey: string
    recipientPublicKey: string
    encryptedGroupKey: string
    permissions: string
  }): Promise<GroupUser | null> {
    const group = await this.groupRepository.findByUuid(dto.groupUuid)
    if (!group || group.userUuid !== dto.originatorUuid) {
      return null
    }

    const groupUser = this.groupUserFactory.create({
      uuid: uuidv4(),
      user_uuid: dto.userUuid,
      group_uuid: dto.groupUuid,
      sender_uuid: dto.senderUuid,
      sender_public_key: dto.senderPublicKey,
      recipient_public_key: dto.recipientPublicKey,
      encrypted_group_key: dto.encryptedGroupKey,
      permissions: dto.permissions,
      created_at_timestamp: this.timer.getTimestampInSeconds(),
      updated_at_timestamp: this.timer.getTimestampInSeconds(),
    })

    return this.groupUserRepository.create(groupUser)
  }

  getGroupUsersForUser(dto: GetUserGroupKeysDTO): Promise<GroupUser[]> {
    return this.groupUserRepository.findAllForUser(dto)
  }

  async getGroupUsers(dto: {
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

  async updateAllGroupUsersForCurrentUser(dto: {
    userUuid: string
    updatedKeys: {
      uuid: string
      encryptedGroupKey: string
      senderPublicKey: string
      recipientPublicKey: string
    }[]
  }): Promise<boolean> {
    for (const updatedKey of dto.updatedKeys) {
      const userKey = await this.groupUserRepository.findAsSenderOrRecipientByUuid(dto.userUuid, updatedKey.uuid)
      if (!userKey) {
        continue
      }

      userKey.encryptedGroupKey = updatedKey.encryptedGroupKey
      userKey.senderPublicKey = updatedKey.senderPublicKey
      userKey.recipientPublicKey = updatedKey.recipientPublicKey

      const updatedAt = this.timer.getTimestampInMicroseconds()
      userKey.updatedAtTimestamp = updatedAt

      await this.groupUserRepository.save(userKey)
    }

    return true
  }

  async updateGroupUsersForAllMembers(dto: {
    originatorUuid: string
    groupUuid: string
    updatedKeys: {
      userUuid: string
      encryptedGroupKey: string
      senderPublicKey: string
    }[]
  }): Promise<boolean> {
    const group = await this.groupRepository.findByUuid(dto.groupUuid)
    if (!group || group.userUuid !== dto.originatorUuid) {
      return false
    }

    for (const keyParams of dto.updatedKeys) {
      const userKey = await this.groupUserRepository.findByUserUuidAndGroupUuid(keyParams.userUuid, dto.groupUuid)
      if (!userKey) {
        continue
      }

      userKey.encryptedGroupKey = keyParams.encryptedGroupKey
      userKey.senderPublicKey = keyParams.senderPublicKey

      const updatedAt = this.timer.getTimestampInMicroseconds()
      userKey.updatedAtTimestamp = updatedAt

      await this.groupUserRepository.save(userKey)
    }

    return true
  }

  async deleteGroupUser(dto: { originatorUuid: string; groupUuid: string; userUuid: string }): Promise<boolean> {
    const groupUser = await this.groupUserRepository.findByUserUuidAndGroupUuid(dto.userUuid, dto.groupUuid)
    if (!groupUser) {
      return false
    }

    const isAuthorized = groupUser.senderUuid !== dto.originatorUuid && groupUser.userUuid !== dto.originatorUuid
    if (isAuthorized) {
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

  async getAllUserKeysForUser(dto: { userUuid: string }): Promise<GroupUser[]> {
    return this.groupUserRepository.findAllForUser({
      userUuid: dto.userUuid,
      includeSentAndReceived: true,
    })
  }

  async getUserKeysForUserBySender(dto: { userUuid: string; senderUuid: string }): Promise<GroupUser[]> {
    return this.groupUserRepository.findAllForUser({
      userUuid: dto.userUuid,
      senderUuid: dto.senderUuid,
    })
  }
}
