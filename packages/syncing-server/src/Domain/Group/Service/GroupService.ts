import { ItemServiceInterface } from './../../Item/ItemServiceInterface'
import { TimerInterface } from '@standardnotes/time'
import { Group } from '../Model/Group'
import { GroupsRepositoryInterface } from '../Repository/GroupRepositoryInterface'
import { CreateGroupDTO, GroupServiceInterface, UpdateGroupDTO, CreateGroupResult } from './GroupServiceInterface'
import { GroupFactoryInterface } from '../Factory/GroupFactoryInterface'
import { GroupUserServiceInterface } from '../../GroupUser/Service/GroupUserServiceInterface'
import { GroupInviteServiceInterface } from '../../GroupInvite/Service/GroupInviteServiceInterface'
import { v4 as uuidv4 } from 'uuid'
import { Item } from '../../Item/Item'

export class GroupService implements GroupServiceInterface {
  constructor(
    private groupRepository: GroupsRepositoryInterface,
    private groupFactory: GroupFactoryInterface,
    private groupUserService: GroupUserServiceInterface,
    private groupInviteService: GroupInviteServiceInterface,
    private itemService: ItemServiceInterface,
    private timer: TimerInterface,
  ) {}

  async createGroup(dto: CreateGroupDTO): Promise<CreateGroupResult> {
    const timestamp = this.timer.getTimestampInMicroseconds()
    const group = this.groupFactory.create({
      userUuid: dto.userUuid,
      groupHash: {
        uuid: uuidv4(),
        user_uuid: dto.userUuid,
        vault_system_identifier: dto.vaultSystemIdentifier,
        specified_items_key_uuid: dto.specifiedItemsKeyUuid,
        file_upload_bytes_limit: 1_000_000,
        file_upload_bytes_used: 0,
        created_at_timestamp: timestamp,
        updated_at_timestamp: timestamp,
      },
    })

    const savedGroup = await this.groupRepository.create(group)

    const groupUser = await this.groupUserService.addGroupUser({
      groupUuid: savedGroup.uuid,
      userUuid: dto.userUuid,
      permissions: 'admin',
    })

    return { group, groupUser }
  }

  async getGroup(dto: { groupUuid: string }): Promise<Group | null> {
    const group = await this.groupRepository.findByUuid(dto.groupUuid)

    return group
  }

  async getGroups(dto: { userUuid: string; lastSyncTime?: number }): Promise<Group[]> {
    const groupUsers = await this.groupUserService.getAllGroupUsersForUser({
      userUuid: dto.userUuid,
    })

    const groupUuids = groupUsers.map((groupUser) => groupUser.groupUuid)

    if (groupUuids.length === 0) {
      return []
    }

    return this.groupRepository.findAll({ groupUuids, lastSyncTime: dto.lastSyncTime })
  }

  async updateGroup(dto: UpdateGroupDTO): Promise<Group | null> {
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

  async addItemToGroup(dto: { itemUuid: string; groupUuid: string; originatorUuid: string }): Promise<Item | null> {
    const item = await this.itemService.getItem({ itemUuid: dto.itemUuid, userUuid: dto.originatorUuid })
    if (!item) {
      return null
    }

    const groupUser = await this.groupUserService.getUserForGroup({
      userUuid: dto.originatorUuid,
      groupUuid: dto.groupUuid,
    })

    if (!groupUser || groupUser.permissions === 'read') {
      return null
    }

    item.groupUuid = dto.groupUuid
    return this.itemService.saveItem(item)
  }

  async removeItemFromGroup(dto: {
    itemUuid: string
    groupUuid: string
    originatorUuid: string
  }): Promise<Item | null> {
    const item = await this.itemService.getItem({ itemUuid: dto.itemUuid, userUuid: dto.originatorUuid })
    if (!item) {
      return null
    }

    const groupUser = await this.groupUserService.getUserForGroup({
      userUuid: dto.originatorUuid,
      groupUuid: dto.groupUuid,
    })

    if (!groupUser || groupUser.permissions === 'read') {
      return null
    }

    item.groupUuid = null
    return this.itemService.saveItem(item)
  }
}
