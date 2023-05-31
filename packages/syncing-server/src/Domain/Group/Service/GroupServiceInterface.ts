import { GroupUser } from './../../GroupUser/Model/GroupUser'
import { Group } from '../Model/Group'

export type CreateGroupDTO = {
  userUuid: string
  groupUuid: string
  specifiedItemsKeyUuid: string
}

export type CreateGroupResult = {
  group: Group
  groupUser: GroupUser
}

export type UpdateGroupDTO = {
  originatorUuid: string
  groupUuid: string
  specifiedItemsKeyUuid: string
}

export interface GroupServiceInterface {
  createGroup(dto: CreateGroupDTO): Promise<CreateGroupResult | null>

  updateGroup(dto: UpdateGroupDTO): Promise<Group | null>

  deleteGroup(dto: { groupUuid: string; originatorUuid: string }): Promise<boolean>

  getGroup(dto: { groupUuid: string }): Promise<Group | null>

  getGroups(dto: { userUuid: string; lastSyncTime?: number }): Promise<Group[]>
}
