import { TimerInterface } from '@standardnotes/time'
import { GroupUserKey } from '../Model/GroupUserKey'
import { GroupUserKeyFactoryInterface } from '../GroupUserKeyFactoryInterface'
import { v4 as uuidv4 } from 'uuid'
import { GroupUserKeyRepositoryInterface } from '../Repository/GroupUserKeyRepositoryInterface'
import { GroupUserKeyServiceInterface } from './GroupUserKeyServiceInterface'
import { GetUserGroupKeysDTO } from './GetUserGroupUserKeysDTO'
import { GroupsRepositoryInterface } from '../../Group/Repository/GroupRepositoryInterface'

export class GroupUserKeyService implements GroupUserKeyServiceInterface {
  constructor(
    private groupRepository: GroupsRepositoryInterface,
    private groupUserRepository: GroupUserKeyRepositoryInterface,
    private groupUserFactory: GroupUserKeyFactoryInterface,
    private timer: TimerInterface,
  ) {}

  async createGroupUserKey(dto: {
    originatorUuid: string
    groupUuid: string
    userUuid: string
    encryptedGroupKey: string
    senderUuid: string
    senderPublicKey: string
    permissions: string
  }): Promise<GroupUserKey | null> {
    const group = await this.groupRepository.findByUuid(dto.groupUuid)
    if (!group || group.userUuid !== dto.originatorUuid) {
      return null
    }

    const groupUser = this.groupUserFactory.create({
      uuid: uuidv4(),
      user_uuid: dto.userUuid,
      group_uuid: dto.groupUuid,
      encrypted_group_key: dto.encryptedGroupKey,
      sender_uuid: dto.senderUuid,
      sender_public_key: dto.senderPublicKey,
      permissions: dto.permissions,
      created_at_timestamp: this.timer.getTimestampInSeconds(),
      updated_at_timestamp: this.timer.getTimestampInSeconds(),
    })

    return this.groupUserRepository.create(groupUser)
  }

  getGroupUserKeysForUser(dto: GetUserGroupKeysDTO): Promise<GroupUserKey[]> {
    return this.groupUserRepository.findAllForUser(dto)
  }

  async getGroupUsers(dto: {
    groupUuid: string
    originatorUuid: string
  }): Promise<{ users: GroupUserKey[]; isAdmin: boolean } | undefined> {
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

  async updateGroupUserKeysForAllMembers(dto: {
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

  async deleteGroupUserKey(dto: { originatorUuid: string; groupUuid: string; userUuid: string }): Promise<boolean> {
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

  async deleteAllGroupUserKeysForGroup(dto: { originatorUuid: string; groupUuid: string }): Promise<boolean> {
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

  async getUserKeysForUserBySender(dto: { userUuid: string; senderUuid: string }): Promise<GroupUserKey[]> {
    return this.groupUserRepository.findAllForUser({
      userUuid: dto.userUuid,
      senderUuid: dto.senderUuid,
    })
  }
}
