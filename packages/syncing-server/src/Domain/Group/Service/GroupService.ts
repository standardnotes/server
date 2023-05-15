import { ItemHash } from './../../Item/ItemHash'
import { GroupUser } from '../../GroupUser/Model/GroupUser'
import { Group } from '../Model/Group'

import { GroupsRepositoryInterface } from '../Repository/GroupRepositoryInterface'
import { GroupServiceInterface } from './GroupServiceInterface'

import { GroupFactoryInterface } from '../Factory/GroupFactoryInterface'
import { TimerInterface } from '@standardnotes/time'
import { GroupUserServiceInterface } from '../../GroupUser/Service/GroupUserService'

import { v4 as uuidv4 } from 'uuid'
import { GetItem } from '../../UseCase/GetItem/GetItem'
import { SaveItemUseCase } from '../../UseCase/SaveItem'
import { ProjectorInterface } from '../../../Projection/ProjectorInterface'
import { Item } from '../../Item/Item'
import { ItemProjection } from '../../../Projection/ItemProjection'

export class GroupService implements GroupServiceInterface {
  constructor(
    private groupRepository: GroupsRepositoryInterface,
    private groupFactory: GroupFactoryInterface,
    private groupUserSerivce: GroupUserServiceInterface,
    private getItem: GetItem,
    private saveItem: SaveItemUseCase,
    private itemProjector: ProjectorInterface<Item, ItemProjection>,
    private timer: TimerInterface,
  ) {}

  async createGroup(userUuid: string): Promise<Group | null> {
    const group = this.groupFactory.create({
      userUuid,
      groupHash: {
        uuid: uuidv4(),
        user_uuid: userUuid,
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
  }): Promise<GroupUser | null> {
    const user = await this.groupUserSerivce.createGroupUser(dto.groupUuid, dto.inviteeUuid, dto.encryptedGroupKey)

    return user
  }

  async addItemToGroup(dto: {
    groupUuid: string
    userUuid: string
    itemUuid: string
    apiVersion: string
    readOnlyAccess: boolean
    sessionUuid: string | null
  }): Promise<{ success: boolean }> {
    const getItemResult = await this.getItem.execute({ itemUuid: dto.itemUuid, userUuid: dto.userUuid })

    if (!getItemResult.success) {
      return { success: false }
    }

    const itemHash = await this.itemProjector.projectFull(getItemResult.item)
    itemHash.group_uuid = dto.groupUuid

    const saveItemResult = await this.saveItem.execute({
      itemHash: <ItemHash>itemHash,
      userUuid: dto.userUuid,
      apiVersion: dto.apiVersion,
      readOnlyAccess: dto.readOnlyAccess,
      sessionUuid: dto.sessionUuid,
    })

    return { success: saveItemResult.success }
  }

  getGroup(groupUuid: string): Promise<Group | null> {
    return this.groupRepository.findByUuid(groupUuid)
  }

  async getUserGroups(userUuid: string): Promise<Group[]> {
    return this.groupRepository.findAll({ userUuid })
  }
}
